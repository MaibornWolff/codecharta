package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val INSTANCE_VARIABLE = "instance_variable"
private const val CLASS_VARIABLE = "class_variable"
private const val GLOBAL_VARIABLE = "global_variable"
private const val CONSTANT = "constant"

/**
 * Extracts identifier from assignment, stripping variable prefixes.
 */
internal fun extractFromAssignment(node: TSNode, sourceCode: String): String? =
    extractFromAssignmentTarget(node.getChildByFieldName("left"), sourceCode)

/**
 * Extracts identifier from assignment target, stripping @, @@, $ prefixes.
 */
private fun extractFromAssignmentTarget(node: TSNode?, sourceCode: String): String? {
    if (node == null) return null
    val text = TreeTraversal.getNodeText(node, sourceCode)
    return when (node.type) {
        IDENTIFIER -> text
        INSTANCE_VARIABLE -> text.removePrefix("@")
        CLASS_VARIABLE -> text.removePrefix("@@")
        GLOBAL_VARIABLE -> text.removePrefix("$")
        CONSTANT -> text
        else -> null
    }
}
