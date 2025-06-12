package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class TypescriptQueries : MetricQueries {
    companion object {
        private val complexityNodes = listOf(
            "if_statement",
            "optional_chain",
            "binary_expression operator: \"&&\"",
            "binary_expression operator: \"??\"",
            "binary_expression operator: \"||\"",
            "for_statement",
            "switch_case",
            "function_declaration",
            "generator_function_declaration",
            "generator_function",
            "method_definition",
            "function_expression",
            "arrow_function",
            "while_statement",
            "for_in_statement",
            "do_statement",
            "catch_clause",
            "throw_statement",
            "ternary_expression",
            "conditional_type"
        )

        private val commentNodes = listOf(
            "comment",
            "html_comment"
        )
    }

    override val complexityQuery = buildQuery(AvailableMetrics.COMPLEXITY, complexityNodes)
    override val commentLinesQuery = buildQuery(AvailableMetrics.COMMENT_LINES, commentNodes)
}
