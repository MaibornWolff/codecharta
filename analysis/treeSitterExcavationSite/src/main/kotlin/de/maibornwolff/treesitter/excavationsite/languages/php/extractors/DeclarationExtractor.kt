package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.fieldOfType

/**
 * The declarations of a PHP file wherever they stand, grouped by kind, each with the namespace of the block it stands
 * in as parent path; a constant `define` declares has the namespace its name gives. A file without any is one
 * [DeclarationType.SCRIPT] that uses what the whole file uses.
 *
 * A constant uses what its value names.
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
    private const val NAME = "name"
    private const val ARGUMENTS = "arguments"
    private const val ARGUMENT = "argument"
    private const val NAME_FIELD = "name"
    private const val FUNCTION_FIELD = "function"
    private const val ARGUMENTS_FIELD = "arguments"
    private const val DEFINE = "define"
    private const val ESCAPED_SEPARATOR = "\\\\"
    private val MEMBER_LISTS = setOf("declaration_list", "enum_declaration_list")

    private val DECLARING_TYPES = setOf(
        CLASS_DECLARATION,
        TRAIT_DECLARATION,
        FUNCTION_DEFINITION,
        INTERFACE_DECLARATION,
        ENUM_DECLARATION,
        CONST_DECLARATION,
        FUNCTION_CALL_EXPRESSION
    )

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val nodesByType = TreeTraversal.findAllDescendantsGroupedByType(rootNode, DECLARING_TYPES)
        val nodesOfType = { type: String -> nodesByType[type].orEmpty() }
        val blocks = NamespaceBlocks.of(rootNode)
        val inBlocks = { type: String, declare: (SyntaxNode) -> List<Declaration> ->
            nodesOfType(type).flatMap { node -> declare(node).map { it.copy(parentPath = NamespaceBlocks.namespaceOf(node, blocks)) } }
        }
        val declarations = inBlocks(CLASS_DECLARATION) { listOfNotNull(namedByField(it, DeclarationType.CLASS, blocks)) } +
            inBlocks(TRAIT_DECLARATION) { listOfNotNull(namedByField(it, DeclarationType.CLASS, blocks)) } +
            inBlocks(FUNCTION_DEFINITION) { listOfNotNull(function(it, blocks)) } +
            inBlocks(INTERFACE_DECLARATION) { listOfNotNull(namedByField(it, DeclarationType.INTERFACE, blocks)) } +
            inBlocks(ENUM_DECLARATION) { listOfNotNull(namedByField(it, DeclarationType.ENUM, blocks)) } +
            inBlocks(CONST_DECLARATION) { namespaceConstants(it, blocks) } +
            nodesOfType(FUNCTION_CALL_EXPRESSION).mapNotNull { definedConstant(it, blocks) }
        return declarations.ifEmpty { listOf(script(rootNode, blocks)) }
    }

    private fun namedByField(declaration: SyntaxNode, type: DeclarationType, blocks: List<NamespaceBlock>): Declaration? {
        val name = declaration.fieldOfType(NAME_FIELD, NAME) ?: return null
        return Declaration(name.text, type, UsedTypeExtractor.extract(declaration, blocks))
    }

    private fun function(function: SyntaxNode, blocks: List<NamespaceBlock>): Declaration? {
        val name = TreeTraversal.findFirstChildTextByType(function, NAME) ?: return null
        return Declaration(name, DeclarationType.FUNCTION, UsedTypeExtractor.extract(function, blocks))
    }

    // A `const` outside a class, interface or enum; the first name of each element is the one it declares
    private fun namespaceConstants(constDeclaration: SyntaxNode, blocks: List<NamespaceBlock>): List<Declaration> {
        if (constDeclaration.parent.type in MEMBER_LISTS) return emptyList()
        return constDeclaration
            .children()
            .filter { it.type == CONST_ELEMENT }
            .mapNotNull { element ->
                val name = element.children().firstOrNull { it.type == NAME } ?: return@mapNotNull null
                Declaration(name.text, DeclarationType.VARIABLE, UsedTypeExtractor.extract(element, blocks))
            }.toList()
    }

    // `define('Game\MAX', 3)` declares the constant its first argument names, in the namespace that name gives
    private fun definedConstant(call: SyntaxNode, blocks: List<NamespaceBlock>): Declaration? {
        val function = call.fieldOfType(FUNCTION_FIELD, NAME) ?: return null
        val arguments = call.fieldOfType(ARGUMENTS_FIELD, ARGUMENTS) ?: return null
        if (function.text != DEFINE) return null
        val (nameArgument, valueArguments) = arguments.namedChildren().filter { it.type == ARGUMENT }.toList().let {
            it.firstOrNull() to
                it.drop(1)
        }
        nameArgument ?: return null
        val path = nameArgument.text
            .withoutQuotes()
            .replace(
                ESCAPED_SEPARATOR,
                NamespaceUses.NAMESPACE_SEPARATOR
            ).split(NamespaceUses.NAMESPACE_SEPARATOR)
        val usedTypes = valueArguments.flatMap { UsedTypeExtractor.extract(it, blocks) }.toCollection(LinkedHashSet())
        return Declaration(path.last(), DeclarationType.VARIABLE, usedTypes, parentPath = path.dropLast(1))
    }

    private fun script(rootNode: SyntaxNode, blocks: List<NamespaceBlock>) =
        Declaration(name = "", type = DeclarationType.SCRIPT, usedTypes = UsedTypeExtractor.extract(rootNode, blocks))
}
