package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val SIMPLE_IDENTIFIER = "simple_identifier"
private const val VARIABLE_DECLARATION = "variable_declaration"
private const val UNDERSCORE = "_"

/**
 * Extracts identifiers from variable declarations within a node.
 *
 * Used for lambda_parameters and multi_variable_declaration nodes.
 * Finds all variable_declaration children and extracts simple_identifier from each.
 *
 * Filters out underscore identifiers.
 */
internal fun extractLambdaParameterIdentifiers(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .filter { it.type == VARIABLE_DECLARATION }
    .mapNotNull {
        TreeTraversal.findFirstChildTextByType(it, sourceCode, SIMPLE_IDENTIFIER)
    }.filter { it != UNDERSCORE }
    .toList()
