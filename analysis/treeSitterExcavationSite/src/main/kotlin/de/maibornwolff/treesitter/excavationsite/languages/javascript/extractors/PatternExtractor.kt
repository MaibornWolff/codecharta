package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.ARRAY_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.OBJECT_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.PAIR_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.SHORTHAND_PROPERTY_IDENTIFIER_PATTERN
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val REST_PATTERN = "rest_pattern"
private const val OBJECT_ASSIGNMENT_PATTERN = "object_assignment_pattern"
private const val ASSIGNMENT_PATTERN = "assignment_pattern"

/**
 * Recursively extracts identifiers from destructuring patterns.
 */
internal fun extractIdentifiersFromPattern(node: TSNode, sourceCode: String): List<String> = when (node.type) {
    SHORTHAND_PROPERTY_IDENTIFIER_PATTERN,
    IDENTIFIER -> {
        listOf(TreeTraversal.getNodeText(node, sourceCode))
    }
    PAIR_PATTERN -> extractIdentifiersFromPairPattern(node, sourceCode)
    OBJECT_ASSIGNMENT_PATTERN,
    ASSIGNMENT_PATTERN -> {
        extractIdentifiersFromAssignmentPattern(node, sourceCode)
    }
    REST_PATTERN -> {
        listOfNotNull(
            TreeTraversal.findFirstChildTextByType(
                node,
                sourceCode,
                IDENTIFIER
            )
        )
    }
    else -> node.children().flatMap { extractIdentifiersFromPattern(it, sourceCode) }.toList()
}

/**
 * Extracts identifiers from pair patterns in object destructuring.
 */
internal fun extractIdentifiersFromPairPattern(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            IDENTIFIER -> {
                listOf(TreeTraversal.getNodeText(child, sourceCode))
            }
            OBJECT_PATTERN,
            ARRAY_PATTERN -> extractIdentifiersFromPattern(child, sourceCode)
            else -> emptyList()
        }
    }.toList()

/**
 * Extracts identifiers from assignment patterns with default values.
 */
internal fun extractIdentifiersFromAssignmentPattern(node: TSNode, sourceCode: String): List<String> = node.children().firstOrNull()?.let {
    extractIdentifiersFromPattern(it, sourceCode)
} ?: emptyList()
