package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val VARIABLE_NAME = "variable_name"

/**
 * Extracts left-hand variable name from assignment.
 * Example: `$count = 5;` -> "count"
 */
internal fun extractAssignmentTargetName(node: TSNode, sourceCode: String): String? {
    val left = node.getChildByFieldName("left") ?: return null
    return if (left.type == VARIABLE_NAME) {
        stripDollarPrefix(TreeTraversal.getNodeText(left, sourceCode))
    } else {
        null
    }
}
