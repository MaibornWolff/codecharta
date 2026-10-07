package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

/**
 * Extracts docstring content from an expression_statement.
 * Returns null if the expression_statement doesn't contain a single string.
 */
internal fun extractDocstring(node: SyntaxNode): String? {
    val child = node.children().firstOrNull()
    if (child?.type != "string") return null
    val text = child.text
    return StringParser.stripPythonString(text).trim()
}
