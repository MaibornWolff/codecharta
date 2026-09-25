package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

/**
 * Extracts identifier only when it's a direct child of parameters or lambda_parameters.
 * This handles simple parameter identifiers like `def foo(x, y)`.
 */
internal fun extractFromParameterIdentifier(node: TSNode, sourceCode: String): String? {
    val parentType = node.parent?.type
    if (parentType != "parameters" && parentType != "lambda_parameters") {
        return null
    }
    return TreeTraversal.getNodeText(node, sourceCode)
}
