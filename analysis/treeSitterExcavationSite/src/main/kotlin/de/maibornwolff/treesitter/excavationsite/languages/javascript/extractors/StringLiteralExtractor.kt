package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.CALL_EXPRESSION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_STATEMENT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IMPORT_STATEMENT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.REQUIRE
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val IMPORT = "import"

/**
 * Extracts non-import string literals from JavaScript/TypeScript code.
 *
 * Returns null for strings inside import/export statements or require() calls,
 * allowing them to be skipped during extraction.
 */
internal fun extractNonImportString(node: SyntaxNode): String? {
    if (isImportString(node)) return null
    val text = node.text
    if (!text.startsWith("\"") && !text.startsWith("'")) return null
    return StringParser.stripAnyQuotes(text)
}

/**
 * Extracts non-import template strings from JavaScript/TypeScript code.
 *
 * Returns null for strings inside import/export statements or require() calls.
 */
internal fun extractNonImportTemplateString(node: SyntaxNode): String? {
    if (isImportString(node)) return null
    val text = node.text
    return StringParser.stripBackticks(text)
}

private fun isImportString(node: SyntaxNode): Boolean {
    if (TreeTraversal.hasAncestorOfTypes(node, IMPORT_STATEMENT, EXPORT_STATEMENT)) return true

    val callExpr = TreeTraversal.findAncestorOfType(node, CALL_EXPRESSION) ?: return false
    val funcName = TreeTraversal.findChildByType(callExpr, "identifier")
        ?: callExpr.getChild(0).takeUnless { it.isNull }?.let { it.text }
    return funcName == REQUIRE || funcName == IMPORT
}
