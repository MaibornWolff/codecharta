package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.UsedTypeExtractor.FileNames
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.fieldOfType

/**
 * The declarations of a PHP file wherever they stand, grouped by kind, each with the namespace of the block it stands
 * in as parent path (a `define` has none). A file without any is one
 * [DeclarationType.SCRIPT] that uses what the whole file uses.
 *
 * A trait and a constant are searched for used types in their name only, so they use nothing but an imported
 * constant whose name occurs in their own. A `const` whose value is another constant declares that one as well.
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

    private val DECLARING_TYPES = setOf(
        CLASS_DECLARATION,
        TRAIT_DECLARATION,
        FUNCTION_DEFINITION,
        INTERFACE_DECLARATION,
        ENUM_DECLARATION,
        CONST_DECLARATION,
        FUNCTION_CALL_EXPRESSION,
        NamespaceUses.NAMESPACE_USE_DECLARATION
    )

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val nodesByType = TreeTraversal.findAllDescendantsGroupedByType(rootNode, DECLARING_TYPES)
        val nodesOfType = { type: String -> nodesByType[type].orEmpty() }
        val importedNames = NamespaceUses.importedNames(nodesOfType(NamespaceUses.NAMESPACE_USE_DECLARATION))
        val blocks = NamespaceBlocks.of(rootNode)
        val fileNames = FileNames(importedNames, blocks)
        val inBlocks = { type: String, declare: (SyntaxNode) -> List<Declaration> ->
            nodesOfType(type).flatMap { node -> declare(node).map { it.copy(parentPath = NamespaceBlocks.namespaceOf(node, blocks)) } }
        }
        val declarations = inBlocks(CLASS_DECLARATION) { listOfNotNull(namedByField(it, DeclarationType.CLASS, fileNames)) } +
            inBlocks(TRAIT_DECLARATION) { listOfNotNull(trait(it, fileNames)) } +
            inBlocks(FUNCTION_DEFINITION) { listOfNotNull(function(it, fileNames)) } +
            inBlocks(INTERFACE_DECLARATION) { listOfNotNull(namedByField(it, DeclarationType.INTERFACE, fileNames)) } +
            inBlocks(ENUM_DECLARATION) { listOfNotNull(namedByField(it, DeclarationType.ENUM, fileNames)) } +
            inBlocks(CONST_DECLARATION) { topLevelConstants(it, fileNames) } +
            nodesOfType(FUNCTION_CALL_EXPRESSION).mapNotNull { definedConstant(it, fileNames) }
        return declarations.ifEmpty { listOf(script(rootNode, fileNames)) }
    }

    private fun namedByField(declaration: SyntaxNode, type: DeclarationType, fileNames: FileNames): Declaration? {
        val name = declaration.fieldOfType(NAME_FIELD, NAME) ?: return null
        return Declaration(name.text, type, UsedTypeExtractor.extract(declaration, fileNames))
    }

    private fun trait(trait: SyntaxNode, fileNames: FileNames): Declaration? {
        val name = trait.fieldOfType(NAME_FIELD, NAME) ?: return null
        return searchedInNameOnly(name, DeclarationType.CLASS, fileNames)
    }

    private fun function(function: SyntaxNode, fileNames: FileNames): Declaration? {
        val name = TreeTraversal.findFirstChildTextByType(function, NAME) ?: return null
        return Declaration(name, DeclarationType.FUNCTION, UsedTypeExtractor.extract(function, fileNames))
    }

    private fun topLevelConstants(constDeclaration: SyntaxNode, fileNames: FileNames): List<Declaration> {
        if (constDeclaration.parent.type != PROGRAM) return emptyList()
        return constDeclaration
            .children()
            .filter { it.type == CONST_ELEMENT }
            .flatMap { element -> element.children().filter { it.type == NAME } }
            .map { name -> searchedInNameOnly(name, DeclarationType.VARIABLE, fileNames) }
            .toList()
    }

    private fun definedConstant(call: SyntaxNode, fileNames: FileNames): Declaration? {
        val function = call.fieldOfType(FUNCTION_FIELD, NAME) ?: return null
        val arguments = call.fieldOfType(ARGUMENTS_FIELD, ARGUMENTS) ?: return null
        if (function.text != DEFINE) return null
        val nameArgument = arguments.namedChildren().firstOrNull { it.type == ARGUMENT } ?: return null
        return Declaration(
            nameArgument.text.withoutQuotes(),
            DeclarationType.VARIABLE,
            UsedTypeExtractor.extract(nameArgument, fileNames)
        )
    }

    private fun script(rootNode: SyntaxNode, fileNames: FileNames) =
        Declaration(name = "", type = DeclarationType.SCRIPT, usedTypes = UsedTypeExtractor.extract(rootNode, fileNames))

    private fun searchedInNameOnly(name: SyntaxNode, type: DeclarationType, fileNames: FileNames) =
        Declaration(name.text, type, UsedTypeExtractor.extract(name, fileNames))
}
