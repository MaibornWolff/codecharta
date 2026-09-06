package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IMPLICIT_PARAMETER = "implicit_parameter"

/**
 * Extracts single implicit parameter from lambda: `x => x * 2`
 *
 * Returns the identifier only if the first child is an implicit_parameter.
 */
internal fun extractLambdaSingleParameter(node: TSNode, sourceCode: String): String? {
    val firstChild = node.children().firstOrNull() ?: return null
    return if (firstChild.type == IMPLICIT_PARAMETER) {
        TreeTraversal.getNodeText(firstChild, sourceCode)
    } else {
        null
    }
}
