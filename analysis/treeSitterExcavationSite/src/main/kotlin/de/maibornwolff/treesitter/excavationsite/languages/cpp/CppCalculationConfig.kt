package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.shared.domain.CalculationConfig
import de.maibornwolff.treesitter.excavationsite.shared.domain.IgnoreRule

internal object CppCalculationConfig {
    private const val ABSTRACT_FUNCTION_DECLARATOR = "abstract_function_declarator"
    private const val LAMBDA_EXPRESSION = "lambda_expression"
    private const val FUNCTION_DECLARATOR = "function_declarator"
    private const val FUNCTION_DEFINITION = "function_definition"

    val config = CalculationConfig(
        ignoreForComplexity = listOf(
            IgnoreRule.TypeWithParentType(ABSTRACT_FUNCTION_DECLARATOR, LAMBDA_EXPRESSION),
            IgnoreRule.TypeWithParentType(FUNCTION_DECLARATOR, FUNCTION_DEFINITION)
        )
    )
}
