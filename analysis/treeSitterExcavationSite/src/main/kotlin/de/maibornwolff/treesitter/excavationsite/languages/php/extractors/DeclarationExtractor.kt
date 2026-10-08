package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The declarations of a PHP file wherever they stand, grouped in this order: classes, traits, functions, interfaces,
 * enums, constants declared with `const` at the top level of the file and constants declared with `define`. A file
 * without any is one [DeclarationType.SCRIPT] that uses what the whole file uses.
 *
 * A trait and a constant use nothing but imported constants whose name occurs in their own name, and a `const`
 * whose value is another constant declares that one as well.
 */
internal object DeclarationExtractor {
    private const val CLASS_DECLARATION = "class_declaration"
    private const val TRAIT_DECLARATION = "trait_declaration"
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val INTERFACE_DECLARATION = "interface_declaration"
    private const val ENUM_DECLARATION = "enum_declaration"
    private const val CONST_DECLARATION = "const_declaration"
    private const val CONST_ELEMENT = "const_element"
    private const val FUNCTION_CALL_EXPRESSION = "function_call_expression"
    private const val PROGRAM = "program"
    private const val NAME = "name"
    private const val ARGUMENTS = "arguments"
    private const val ARGUMENT = "argument"
    private const val NAME_FIELD = "name"
    private const val FUNCTION_FIELD = "function"
    private const val ARGUMENTS_FIELD = "arguments"
    private const val DEFINE = "define"

    private val DECLARING_TYPES = arrayOf(
        CLASS_DECLARATION,
        TRAIT_DECLARATION,
        FUNCTION_DEFINITION,
        INTERFACE_DECLARATION,
        ENUM_DECLARATION,
        CONST_DECLARATION,
        FUNCTION_CALL_EXPRESSION,
        NamespaceUses.NAMESPACE_USE_DECLARATION
    )
    private val TYPES_NAMED_BY_FIELD = mapOf(
        CLASS_DECLARATION to DeclarationType.CLASS,
        INTERFACE_DECLARATION to DeclarationType.INTERFACE,
        ENUM_DECLARATION to DeclarationType.ENUM
    )

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val nodesByType = TreeTraversal.findAllDescendantsGroupedByType(rootNode, DECLARING_TYPES.toSet())
        val useDeclarations = nodesByType[NamespaceUses.NAMESPACE_USE_DECLARATION].orEmpty()
        val namesByAlias = NamespaceUses.namesByAlias(useDeclarations)
        val importedConstants = NamespaceUses.constantPaths(useDeclarations).map { it.last() }
        val usedTypesOf = { declaration: SyntaxNode -> UsedTypeExtractor.extract(declaration, namesByAlias, importedConstants) }

        val declarations = declarationsNamedByField(nodesByType, CLASS_DECLARATION, usedTypesOf) +
            nodesByType[TRAIT_DECLARATION]
                .orEmpty()
                .mapNotNull {
                    nameOf(
                        it
                    )
                }.map { toDeclaration(it, DeclarationType.CLASS, usedTypesOf) } +
            nodesByType[FUNCTION_DEFINITION].orEmpty().mapNotNull { function ->
                val name = function.children().firstOrNull { it.type == NAME }?.text ?: return@mapNotNull null
                Declaration(name, DeclarationType.FUNCTION, usedTypesOf(function))
            } +
            declarationsNamedByField(nodesByType, INTERFACE_DECLARATION, usedTypesOf) +
            declarationsNamedByField(nodesByType, ENUM_DECLARATION, usedTypesOf) +
            nodesByType[CONST_DECLARATION].orEmpty().flatMap { namesOfTopLevelConstants(it) }.map {
                toDeclaration(it, DeclarationType.VARIABLE, usedTypesOf)
            } +
            nodesByType[FUNCTION_CALL_EXPRESSION].orEmpty().mapNotNull { nameArgumentOfDefine(it) }.map { nameArgument ->
                Declaration(nameArgument.text.trim('\'', '"'), DeclarationType.VARIABLE, usedTypesOf(nameArgument))
            }
        return declarations.ifEmpty { listOf(Declaration(name = "", type = DeclarationType.SCRIPT, usedTypes = usedTypesOf(rootNode))) }
    }

    private fun declarationsNamedByField(
        nodesByType: Map<String, List<SyntaxNode>>,
        nodeType: String,
        usedTypesOf: (SyntaxNode) -> Set<UsedType>
    ): List<Declaration> = nodesByType[nodeType].orEmpty().mapNotNull { declaration ->
        nameOf(declaration)?.let { Declaration(it.text, TYPES_NAMED_BY_FIELD.getValue(nodeType), usedTypesOf(declaration)) }
    }

    private fun toDeclaration(name: SyntaxNode, type: DeclarationType, usedTypesOf: (SyntaxNode) -> Set<UsedType>) =
        Declaration(name.text, type, usedTypesOf(name))

    private fun nameOf(declaration: SyntaxNode): SyntaxNode? = declaration.getChildByFieldName(NAME_FIELD).orNull()?.takeIf {
        it.type ==
            NAME
    }

    private fun namesOfTopLevelConstants(constDeclaration: SyntaxNode): List<SyntaxNode> {
        if (constDeclaration.parent.type != PROGRAM) return emptyList()
        return constDeclaration
            .children()
            .filter { it.type == CONST_ELEMENT }
            .flatMap { element -> element.children().filter { it.type == NAME } }
            .toList()
    }

    private fun nameArgumentOfDefine(call: SyntaxNode): SyntaxNode? {
        val function = call.getChildByFieldName(FUNCTION_FIELD).orNull()?.takeIf { it.type == NAME } ?: return null
        val arguments = call.getChildByFieldName(ARGUMENTS_FIELD).orNull()?.takeIf { it.type == ARGUMENTS } ?: return null
        if (function.text != DEFINE) return null
        return arguments.namedChildren().firstOrNull { it.type == ARGUMENT }
    }
}
