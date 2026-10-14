package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * tree-sitter-kotlin 0.3.8 has no rule for `fun interface`. It parses `fun interface Name` either as an ERROR
 * holding `fun`, a type named `interface` and the name, followed by the body as a lambda, or as a function
 * declaration with `interface` as its receiver type, depending on what the body holds.
 */
internal object FunInterfaceExtractor {
    private const val ERROR = "ERROR"
    private const val FUNCTION_DECLARATION = "function_declaration"
    private const val FUN_KEYWORD = "fun"
    private const val USER_TYPE = "user_type"
    private const val INTERFACE_KEYWORD = "interface"
    private const val SIMPLE_IDENTIFIER = "simple_identifier"
    private const val LAMBDA_LITERAL = "lambda_literal"

    fun extract(rootNode: SyntaxNode, importedNames: Set<String>): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, ERROR, FUNCTION_DECLARATION)
        .mapNotNull { node -> nameOf(node)?.let { name -> declaration(node, name, importedNames) } }

    fun isFunInterface(node: SyntaxNode): Boolean = nameOf(node) != null

    private fun nameOf(node: SyntaxNode): String? {
        val children = node.children().toList()
        val funIndex = children.indexOfFirst { it.type == FUN_KEYWORD }
        if (funIndex < 0) return null
        val keyword = children.getOrNull(funIndex + 1)
        if (keyword?.type != USER_TYPE || keyword.text.trim() != INTERFACE_KEYWORD) return null
        return children.getOrNull(funIndex + 2)?.takeIf { it.type == SIMPLE_IDENTIFIER }?.text?.trim()
    }

    private fun declaration(node: SyntaxNode, name: String, importedNames: Set<String>): Declaration {
        val body = bodyOf(node)
        val usedTypes = UsedTypeExtractor.extract(node, importedNames) +
            body?.let { UsedTypeExtractor.extract(it, importedNames) }.orEmpty()
        return Declaration(
            name = name,
            type = DeclarationType.INTERFACE,
            usedTypes = usedTypes.filterNot { it == UsedType(INTERFACE_KEYWORD) || it == UsedType(name) }.toSet(),
            parentPath = DeclarationExtractor.findParentPath(node, emptyMap())
        )
    }

    private fun bodyOf(node: SyntaxNode): SyntaxNode? {
        val siblings = node.parent.children().toList()
        return siblings.getOrNull(siblings.indexOf(node) + 1)?.takeIf { it.type == LAMBDA_LITERAL }
    }
}
