package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val CALL = "call"
private const val STRING_CONTENT = "string_content"
private val REQUIRE_METHODS = setOf("require", "require_relative", "load", "autoload")

/**
 * Extracts non-import string literals from Ruby code.
 *
 * Returns null for strings inside require/require_relative/load calls,
 * allowing them to be skipped during extraction.
 */
internal fun extractNonImportString(node: SyntaxNode): String? {
    if (isRequireCall(node)) return null
    return extractStringContent(node)
}

private fun extractStringContent(node: SyntaxNode): String {
    val content = TreeTraversal.findFirstChildTextByType(node, STRING_CONTENT)
    if (content != null) return content
    val text = node.text
    return text.removeSurrounding("\"").removeSurrounding("'")
}

private fun isRequireCall(node: SyntaxNode): Boolean {
    val call = TreeTraversal.findAncestorOfType(node, CALL) ?: return false
    val methodName = TreeTraversal.findFirstChildTextByType(call, "identifier")
    return methodName in REQUIRE_METHODS
}
