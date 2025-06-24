package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class PythonQueries : MetricQueries {
    companion object {
        private val complexityNodes = listOf(
            // if
            "if_statement",
            "elif_clause",
            "if_clause",
            // loop
            "for_statement",
            "while_statement",
            "for_in_clause",
            // conditional
            "conditional_expression",
            "list",
            "boolean_operator",
            // logical binary
            // case label
            "case_pattern",
            // catch block
            "except_clause",
            // function
            "function_definition",
            "lambda"
        )

        // in python unassigned strings are used as block comments, meaning an expression that only has string as a child
        private val commentNodes = listOf(
            "comment",
            "expression_statement (string)"
        )
    }

    override val complexityQuery = buildQuery(AvailableMetrics.COMPLEXITY, complexityNodes)
    override val commentLinesQuery = buildQuery(AvailableMetrics.COMMENT_LINES, commentNodes)
}
