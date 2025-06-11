package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class KotlinQueries : MetricQueries {
    companion object {
        private val complexityNodes = listOf(
            "if_expression",
            "for_statement",
            "while_statement",
            "do_while_statement",
            "elvis_expression",
            "when_entry",
            "catch_block",
            "function_declaration",
            "anonymous_function",
            "anonymous_initializer",
            "lambda_literal",
            "secondary_constructor",
            "setter",
            "getter"
        )
        private val commentNodes = listOf(
            "line_comment",
            "multiline_comment"
        )
    }

    override val complexityQuery = buildQuery(AvailableMetrics.COMPLEXITY, complexityNodes)
    override val commentLinesQuery = buildQuery(AvailableMetrics.COMMENT_LINES, commentNodes)
}
