package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"

/**
 * Extracts identifier from lambda without parentheses: `item -> process(item)`
 *
 * Returns the identifier only if the first child is a bare identifier
 * (not wrapped in parentheses or formal parameters).
 */
internal fun extractLambdaSingleParameter(node: SyntaxNode): String? {
    val firstChild = node.children().firstOrNull() ?: return null
    return if (firstChild.type == IDENTIFIER) {
        firstChild.text
    } else {
        null
    }
}
