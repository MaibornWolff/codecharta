package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val METHOD_PARAMETERS = "method_parameters"
private const val BLOCK_PARAMETERS = "block_parameters"
private const val LAMBDA_PARAMETERS = "lambda_parameters"
private const val DESTRUCTURED_PARAMETER = "destructured_parameter"
private const val LEFT_ASSIGNMENT_LIST = "left_assignment_list"
private const val ARRAY_PATTERN = "array_pattern"

/**
 * Extracts identifier only when in valid parameter/destructuring context.
 */
internal fun extractFromIdentifierInContext(node: TSNode, sourceCode: String): String? {
    val validParentTypes = setOf(
        METHOD_PARAMETERS,
        BLOCK_PARAMETERS,
        LAMBDA_PARAMETERS,
        DESTRUCTURED_PARAMETER,
        LEFT_ASSIGNMENT_LIST,
        ARRAY_PATTERN
    )
    return if (node.parent?.type in validParentTypes) {
        TreeTraversal.getNodeText(node, sourceCode)
    } else {
        null
    }
}
