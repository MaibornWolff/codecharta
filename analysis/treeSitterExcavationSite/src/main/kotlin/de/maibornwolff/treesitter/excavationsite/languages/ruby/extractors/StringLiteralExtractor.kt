package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val CALL = "call"
private const val STRING_CONTENT = "string_content"
private val REQUIRE_METHODS = setOf("require", "require_relative", "load", "autoload")

/**
 * Extracts non-import string literals from Ruby code.
 *
 * Returns null for strings inside require/require_relative/load calls,
 * allowing them to be skipped during extraction.
 */
internal fun extractNonImportString(node: TSNode, sourceCode: String): String? {
    if (isRequireCall(node, sourceCode)) return null
    return extractStringContent(node, sourceCode)
}

private fun extractStringContent(node: TSNode, sourceCode: String): String {
    val content = TreeTraversal.findChildByType(node, STRING_CONTENT, sourceCode)
    if (content != null) return content
    val text = TreeTraversal.getNodeText(node, sourceCode)
    return text.removeSurrounding("\"").removeSurrounding("'")
}

private fun isRequireCall(node: TSNode, sourceCode: String): Boolean {
    val call = TreeTraversal.findAncestorOfType(node, CALL) ?: return false
    val methodName = TreeTraversal.findChildByType(call, "identifier", sourceCode)
    return methodName in REQUIRE_METHODS
}
