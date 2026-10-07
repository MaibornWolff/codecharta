package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.ARRAY_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.OBJECT_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.PAIR_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.SHORTHAND_PROPERTY_IDENTIFIER_PATTERN
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val REST_PATTERN = "rest_pattern"
private const val OBJECT_ASSIGNMENT_PATTERN = "object_assignment_pattern"
private const val ASSIGNMENT_PATTERN = "assignment_pattern"

/**
 * Recursively extracts identifiers from destructuring patterns.
 */
internal fun extractIdentifiersFromPattern(node: SyntaxNode): List<String> = when (node.type) {
    SHORTHAND_PROPERTY_IDENTIFIER_PATTERN,
    IDENTIFIER -> {
        listOf(node.text)
    }
    PAIR_PATTERN -> extractIdentifiersFromPairPattern(node)
    OBJECT_ASSIGNMENT_PATTERN,
    ASSIGNMENT_PATTERN -> {
        extractIdentifiersFromAssignmentPattern(node)
    }
    REST_PATTERN -> {
        listOfNotNull(
            TreeTraversal.findFirstChildTextByType(
                node,
                IDENTIFIER
            )
        )
    }
    else -> node.children().flatMap { extractIdentifiersFromPattern(it) }.toList()
}

/**
 * Extracts identifiers from pair patterns in object destructuring.
 */
internal fun extractIdentifiersFromPairPattern(node: SyntaxNode): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            IDENTIFIER -> {
                listOf(child.text)
            }
            OBJECT_PATTERN,
            ARRAY_PATTERN -> extractIdentifiersFromPattern(child)
            else -> emptyList()
        }
    }.toList()

/**
 * Extracts identifiers from assignment patterns with default values.
 */
internal fun extractIdentifiersFromAssignmentPattern(node: SyntaxNode): List<String> = node.children().firstOrNull()?.let {
    extractIdentifiersFromPattern(it)
} ?: emptyList()
