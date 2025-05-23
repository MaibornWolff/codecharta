package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class TypescriptQueries : MetricQueries {
    companion object {
        private val complexityNodes = listOf(
            "if_statement",
            "optional_chain",
            "binary_expression operator: \"&&\"",
            "binary_expression operator: \"||\"",
            "for_statement",
            "switch_case",
            "function_declaration",
            "method_definition",
            "function_expression",
            "arrow_function",
            "while_statement",
            "for_in_statement",
            "do_statement",
            "catch_clause",
            "throw_statement",
            "ternary_expression"
        )

        private val commentNodes = listOf(
            "comment",
        )
    }

    override val complexityQuery = buildQuery(AvailableMetrics.COMPLEXITY, complexityNodes)
    override val commentQuery = buildQuery(AvailableMetrics.COMMENT, commentNodes)
}
