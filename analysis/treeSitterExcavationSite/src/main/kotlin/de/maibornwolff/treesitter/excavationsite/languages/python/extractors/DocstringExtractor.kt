package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts docstring content from an expression_statement.
 * Returns null if the expression_statement doesn't contain a single string.
 */
internal fun extractDocstring(node: TSNode, sourceCode: String): String? {
    val child = node.children().firstOrNull()
    if (child?.type != "string") return null
    val text = TreeTraversal.getNodeText(child, sourceCode)
    return StringParser.stripPythonString(text).trim()
}
