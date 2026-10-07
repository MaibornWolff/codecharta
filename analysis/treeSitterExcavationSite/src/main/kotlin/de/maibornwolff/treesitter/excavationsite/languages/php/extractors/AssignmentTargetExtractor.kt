package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val VARIABLE_NAME = "variable_name"

/**
 * Extracts left-hand variable name from assignment.
 * Example: `$count = 5;` -> "count"
 */
internal fun extractAssignmentTargetName(node: SyntaxNode): String? {
    val left = node.getChildByFieldName("left")
    if (left.isNull) return null
    return if (left.type == VARIABLE_NAME) {
        stripDollarPrefix(left.text)
    } else {
        null
    }
}
