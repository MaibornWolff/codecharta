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
 * functions, then the decorated ones, then the variables.
 *
 * Python declares no types to tell a used type from any other name, so a class or function uses every identifier
 * below it that [UseSites] calls a use, and every attribute access `a.b.C` as the name `C` with the namespace prefix
 * `[a, b]`.
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
    private const val ATTRIBUTE_SEPARATOR = "."
    private val DEFINITION_TYPES = setOf(CLASS_DEFINITION, FUNCTION_DEFINITION)

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        if (rootNode.type != MODULE) return emptyList()
        val statements = rootNode.children().toList()
        val definitions = statements.filter { it.type in DEFINITION_TYPES }.map { toDeclaration(definition = it, outermostNode = it) }
        val decoratedDefinitions = statements.filter { it.type == DECORATED_DEFINITION }.map { decorated ->
            toDeclaration(definition = decorated.getChildByFieldName(DEFINITION_FIELD).orNull(), outermostNode = decorated)
        }
        val variables = statements.filter { it.type == EXPRESSION_STATEMENT }.flatMap { assignedVariables(it) }
        return definitions + decoratedDefinitions + variables
    }

    private fun toDeclaration(definition: SyntaxNode?, outermostNode: SyntaxNode): Declaration = Declaration(
        name = definition?.getChildByFieldName(NAME_FIELD)?.orNull()?.text.orEmpty(),
        type = declarationType(definition?.type),
        usedTypes = usedNames(outermostNode)
    )

    private fun declarationType(definitionType: String?): DeclarationType = when (definitionType) {
        CLASS_DEFINITION -> DeclarationType.CLASS
        FUNCTION_DEFINITION -> DeclarationType.FUNCTION
        else -> DeclarationType.UNKNOWN
    }

    private fun usedNames(definition: SyntaxNode): Set<UsedType> {
        val (identifiers, attributes) = TreeTraversal
            .findAllDescendantsOfType(definition, IDENTIFIER, ATTRIBUTE)
            .partition { it.type == IDENTIFIER }
        return identifiers.filter { UseSites.isUse(it) }.mapTo(LinkedHashSet()) { UsedType(it.text) } +
            attributes.map { toQualifiedName(it.text) }
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
