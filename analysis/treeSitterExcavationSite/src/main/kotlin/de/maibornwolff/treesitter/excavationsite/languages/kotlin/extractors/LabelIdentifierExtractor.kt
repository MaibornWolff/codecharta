package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val UNDERSCORE = "_"

/**
 * Removes the @ suffix from label nodes (e.g., "loop@" -> "loop").
 *
 * Returns null if underscore identifier.
 */
internal fun extractLabelIdentifier(node: SyntaxNode): String? {
    val text = node.text
    val identifier = if (text.endsWith("@")) text.dropLast(1) else text
    return identifier.takeIf { it != UNDERSCORE }
}
