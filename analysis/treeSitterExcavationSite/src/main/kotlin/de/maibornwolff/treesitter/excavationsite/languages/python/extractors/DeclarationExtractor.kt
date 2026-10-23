package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.fieldOfType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The classes, functions and assigned variables at the top level of a module: first the undecorated classes and
 * functions, then the decorated ones, then the variables. A class nested in a class follows the class around it, with
 * that class's path as parent path.
 *
 * Python declares no types to tell a used type from any other name, so a class or function uses every identifier
 * below it that [UseSites] calls a use, and every attribute access `a.b.C` as the name `C` with the namespace prefix
 * `[a, b]`, but none that [FunctionScopes] finds bound by a function or comprehension around it.
 */
internal object DeclarationExtractor {
    private const val MODULE = "module"
    private const val CLASS_DEFINITION = "class_definition"
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val DECORATED_DEFINITION = "decorated_definition"
    private const val EXPRESSION_STATEMENT = "expression_statement"
    private const val ASSIGNMENT = "assignment"
    private const val IDENTIFIER = "identifier"
    private const val ATTRIBUTE = "attribute"
    private const val DEFINITION_FIELD = "definition"
    private const val NAME_FIELD = "name"
    private const val LEFT_FIELD = "left"
    private const val BODY_FIELD = "body"
    private const val OBJECT_FIELD = "object"
    private const val ATTRIBUTE_SEPARATOR = "."
    private val DEFINITION_TYPES = setOf(CLASS_DEFINITION, FUNCTION_DEFINITION)

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        if (rootNode.type != MODULE) return emptyList()
        val statements = rootNode.children().toList()
        val definitions = statements.filter { it.type in DEFINITION_TYPES }.flatMap { declarationsOf(it, emptyList()) }
        val decoratedDefinitions = statements.filter { it.type == DECORATED_DEFINITION }.flatMap { declarationsOf(it, emptyList()) }
        val variables = statements.filter { it.type == EXPRESSION_STATEMENT }.flatMap { assignedVariables(it) }
        return definitions + decoratedDefinitions + variables
    }

    // A class nested in a class is a declaration of its own, whose uses are not those of the class around it; the
    // outermost node of a definition is the decorated definition around it, if it has one
    private fun declarationsOf(outermostNode: SyntaxNode, parentPath: List<String>): List<Declaration> {
        val definition = definitionOf(outermostNode)
        val name = definition?.getChildByFieldName(NAME_FIELD)?.orNull()?.text.orEmpty()
        val nestedClasses = nestedClassesOf(definition)
        val declaration = Declaration(
            name = name,
            type = declarationType(definition?.type),
            usedTypes = usedNames(outermostNode, nestedClasses),
            parentPath = parentPath
        )
        return listOf(declaration) + nestedClasses.flatMap { declarationsOf(it, parentPath + name) }
    }

    private fun definitionOf(outermostNode: SyntaxNode): SyntaxNode? =
        if (outermostNode.type == DECORATED_DEFINITION) outermostNode.getChildByFieldName(DEFINITION_FIELD).orNull() else outermostNode

    private fun nestedClassesOf(definition: SyntaxNode?): List<SyntaxNode> {
        if (definition?.type != CLASS_DEFINITION) return emptyList()
        val body = definition.getChildByFieldName(BODY_FIELD).orNull() ?: return emptyList()
        return body.children().filter { statement -> definitionOf(statement)?.type == CLASS_DEFINITION }.toList()
    }

    private fun declarationType(definitionType: String?): DeclarationType = when (definitionType) {
        CLASS_DEFINITION -> DeclarationType.CLASS
        FUNCTION_DEFINITION -> DeclarationType.FUNCTION
        else -> DeclarationType.UNKNOWN
    }

    private fun usedNames(definition: SyntaxNode, nestedDeclarations: List<SyntaxNode>): Set<UsedType> {
        val scopes = FunctionScopes()
        val (identifiers, attributes) = TreeTraversal
            .findAllDescendantsOfType(definition, IDENTIFIER, ATTRIBUTE)
            .filterNot { node -> nestedDeclarations.any { it.startByte <= node.startByte && node.endByte <= it.endByte } }
            .partition { it.type == IDENTIFIER }
        return identifiers.filter { UseSites.isUse(it) && !scopes.isLocal(it) }.mapTo(LinkedHashSet()) { UsedType(it.text) } +
            attributes.filterNot { headOf(it)?.let(scopes::isLocal) == true }.map { toQualifiedName(it.text) }
    }

    // The name an attribute chain starts with, null when it starts with a call or another expression
    private fun headOf(attribute: SyntaxNode): SyntaxNode? {
        var objectNode = attribute.getChildByFieldName(OBJECT_FIELD).orNull()
        while (objectNode?.type == ATTRIBUTE) objectNode = objectNode.getChildByFieldName(OBJECT_FIELD).orNull()
        return objectNode?.takeIf { it.type == IDENTIFIER }
    }

    private fun toQualifiedName(attribute: String): UsedType {
        val segments = attribute.split(ATTRIBUTE_SEPARATOR)
        return UsedType(name = segments.last(), namespacePrefix = segments.dropLast(1))
    }

    private fun assignedVariables(statement: SyntaxNode): List<Declaration> = statement
        .children()
        .filter { it.type == ASSIGNMENT }
        .mapNotNull { assignment -> assignment.fieldOfType(LEFT_FIELD, IDENTIFIER)?.text }
        .map { name -> Declaration(name = name, type = DeclarationType.VARIABLE, usedTypes = emptySet()) }
        .toList()
}
