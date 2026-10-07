package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts identifier only when it's a direct child of parameters or lambda_parameters.
 * This handles simple parameter identifiers like `def foo(x, y)`.
 */
internal fun extractFromParameterIdentifier(node: SyntaxNode): String? {
    val parentType = node.parent.type
    if (parentType != "parameters" && parentType != "lambda_parameters") {
        return null
    }
    return node.text
}
