package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val UNDERSCORE = "_"

/**
 * Removes the @ suffix from label nodes (e.g., "loop@" -> "loop").
 *
 * Returns null if underscore identifier.
 */
internal fun extractLabelIdentifier(node: TSNode, sourceCode: String): String? {
    val text = TreeTraversal.getNodeText(node, sourceCode)
    val identifier = if (text.endsWith("@")) text.dropLast(1) else text
    return identifier.takeIf { it != UNDERSCORE }
}
