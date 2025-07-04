package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class CSharpQueries : MetricQueries {
    companion object {
        private val complexityNodes = listOf(
            // if
            "if_statement",
            // loop
            "do_statement",
            "foreach_statement",
            "for_statement",
            "while_statement",
            // conditional
            "conditional_expression",
            "and_pattern",
            "or_pattern",
            // logical
            "binary_expression operator: \"&&\"",
            "binary_expression operator: \"??\"",
            "binary_expression operator: \"||\"",
            // case
            "switch_section",
            "switch_expression_arm",
            // catch
            "catch_clause",
            // function
            "constructor_declaration",
            "method_declaration",
            "lambda_expression",
            "local_function_statement",
            "accessor_declaration"
        )

        private val commentNodes = listOf(
            "comment"
        )
    }

    override val complexityQuery = buildQuery(AvailableMetrics.COMPLEXITY, complexityNodes)
    override val commentLinesQuery = buildQuery(AvailableMetrics.COMMENT_LINES, commentNodes)
}
