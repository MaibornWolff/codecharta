package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val IMPLICIT_PARAMETER = "implicit_parameter"

/**
 * Extracts single implicit parameter from lambda: `x => x * 2`
 *
 * Returns the identifier only if the first child is an implicit_parameter.
 */
internal fun extractLambdaSingleParameter(node: SyntaxNode): String? {
    val firstChild = node.children().firstOrNull() ?: return null
    return if (firstChild.type == IMPLICIT_PARAMETER) {
        firstChild.text
    } else {
        null
    }
}
