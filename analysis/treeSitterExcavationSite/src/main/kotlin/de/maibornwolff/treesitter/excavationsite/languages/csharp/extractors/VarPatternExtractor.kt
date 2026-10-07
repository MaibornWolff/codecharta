package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val IDENTIFIER = "identifier"
private const val SINGLE_VARIABLE_DESIGNATION = "single_variable_designation"

/**
 * Extracts variable from var_pattern: `var x` or `var (x, y)`
 */
internal fun extractVarPatternVariable(node: SyntaxNode): String? {
    for (child in node.children()) {
        if (child.type == SINGLE_VARIABLE_DESIGNATION) {
            return TreeTraversal.findFirstChildTextByType(
                child,
                IDENTIFIER
            )
        }
    }
    return null
}
