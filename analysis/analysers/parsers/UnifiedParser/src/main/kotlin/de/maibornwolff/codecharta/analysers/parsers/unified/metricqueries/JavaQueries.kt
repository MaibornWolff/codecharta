package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class JavaQueries : MetricQueries {
    companion object {
        private val complexityNodes = listOf(
            "if_statement",
            "do_statement",
            "for_statement",
            "while_statement",
            "enhanced_for_statement",
            "ternary_expression",
            "binary_expression operator: \"&&\"",
            "binary_expression operator: \"||\"",
            "switch_label",
            "catch_clause",
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
