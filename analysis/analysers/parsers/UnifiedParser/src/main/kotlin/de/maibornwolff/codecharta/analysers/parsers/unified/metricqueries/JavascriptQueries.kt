package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class JavascriptQueries : MetricQueries {
    companion object {
        private val complexityNodes = listOf(
            // if
            "if_statement",
            // loop
            "do_statement",
            "for_statement",
            "while_statement",
            "for_in_statement",
            // conditional
            "ternary_expression",
            // logical binary
            "binary_expression operator: \"&&\"",
            "binary_expression operator: \"??\"",
            "binary_expression operator: \"||\"",
            // case
            "switch_case",
            // catch
            "catch_clause",
            // function
            "function_declaration",
            "generator_function_declaration",
            "arrow_function",
            "generator_function",
            "method_definition",
            "class_static_block",
            "function_expression"
        )

        private val commentNodes = listOf(
            "comment",
            "html_comment"
        )
    }

    override val complexityQuery = buildQuery(AvailableMetrics.COMPLEXITY, complexityNodes)
    override val commentLinesQuery = buildQuery(AvailableMetrics.COMMENT_LINES, commentNodes)
}
