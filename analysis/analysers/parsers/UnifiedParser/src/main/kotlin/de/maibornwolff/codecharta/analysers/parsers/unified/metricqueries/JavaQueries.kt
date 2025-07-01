package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class JavaQueries : MetricQueries {
    companion object {
        private val complexityNodes = listOf(
            // if
            "if_statement",
            // loop
            "do_statement",
            "for_statement",
            "while_statement",
            "enhanced_for_statement",
            // conditional
            "ternary_expression",
            // logical
            "binary_expression operator: \"&&\"",
            "binary_expression operator: \"||\"",
            // case
            "switch_label",
            // catch
            "catch_clause",
            // function
            "constructor_declaration",
            "method_declaration",
            "lambda_expression",
            "static_initializer",
            "compact_constructor_declaration"
        )

        private val commentNodes = listOf(
            "block_comment",
            "line_comment"
        )
    }

    override val complexityQuery = buildQuery(AvailableMetrics.COMPLEXITY, complexityNodes)
    override val commentLinesQuery = buildQuery(AvailableMetrics.COMMENT_LINES, commentNodes)
}
