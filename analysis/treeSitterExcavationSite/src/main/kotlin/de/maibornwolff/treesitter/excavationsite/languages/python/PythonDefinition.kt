package de.maibornwolff.treesitter.excavationsite.languages.python

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.LeafNodeRule
import de.maibornwolff.treesitter.excavationsite.shared.domain.Metric

/**
 * Unified Python language definition combining metrics and extraction.
 *
 * Composes PythonMetricMapping and PythonExtractionMapping.
 */
object PythonDefinition : LanguageDefinition {
    override val nodeMetrics: Map<String, Set<Metric>> = PythonMetricMapping.nodeMetrics
    override val nodeExtractions: Map<String, Extract> = PythonExtractionMapping.nodeExtractions

    // ========== Calculation Configuration ==========

    private const val STRING = "string"
    private const val IDENTIFIER = "identifier"
    private const val FUNCTION_DEFINITION = "function_definition"
    private val stringComponentTypes = setOf("string_start", "string_content", "string_end")

    override val calculationConfig = CalculationConfig(
        hasFunctionBodyStartOrEndNode = false,
        ignoreForCommentLines = listOf(
            IgnoreRule.TypeInSet(stringComponentTypes),
            IgnoreRule.SingleChildOfParentWithType(STRING)
        ),
        ignoreForRloc = listOf(
            IgnoreRule.TypeInSet(stringComponentTypes),
            IgnoreRule.SingleChildOfParentWithType(STRING),
            IgnoreRule.FirstChildIsDocstring
        ),
        ignoreForParameters = listOf(
            IgnoreRule.TypeWithParentType(IDENTIFIER, FUNCTION_DEFINITION)
        ),
        countAsLeafNode = LeafNodeRule.WhenParentHasMultipleChildren(STRING)
    )
}
