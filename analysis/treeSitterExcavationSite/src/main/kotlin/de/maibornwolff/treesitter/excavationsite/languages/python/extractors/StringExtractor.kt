package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts string content, but returns null for docstrings.
 * A docstring is a string that is the only child of an expression_statement.
 */
internal fun extractString(node: SyntaxNode): String? {
    if (isDocstring(node)) return null
    val text = node.text
    return StringParser.stripPythonString(text)
}

private fun isDocstring(node: SyntaxNode): Boolean {
    val parent = node.parent
    return !parent.isNull && parent.type == "expression_statement" && parent.childCount == 1
}
