package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val SINGLE_VARIABLE_DESIGNATION = "single_variable_designation"

/**
 * Extracts variable from var_pattern: `var x` or `var (x, y)`
 */
internal fun extractVarPatternVariable(node: TSNode, sourceCode: String): String? {
    for (child in node.children()) {
        if (child.type == SINGLE_VARIABLE_DESIGNATION) {
            return TreeTraversal.findFirstChildTextByType(
                child,
                sourceCode,
                IDENTIFIER
            )
        }
    }
    return null
}
