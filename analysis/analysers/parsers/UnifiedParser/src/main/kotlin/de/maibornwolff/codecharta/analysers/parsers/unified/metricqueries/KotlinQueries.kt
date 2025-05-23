package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class KotlinQueries : MetricQueries {
    companion object {
        private val complexityNodes = listOf(
            //TODO: check if this query is good enough
            "if_expression",
            //"optional_chain",
//            "binary_expression operator: \"&&\"",
//            "binary_expression operator: \"||\"",
            "for_statement",
            "when_expression",
            "function_declaration",
//            "method_definition",
//            "function_expression",
            "anonymous_function",
            "while_statement",
//            "for_in_statement",
            "do_while_statement",
            "catch_block",
//            "throw", theres a problem with this somehow
//            "ternary_expression"
        )
        private val commentNodes = listOf(
            "line_comment",
            "multiline_comment",
        )
    }
    override val complexityQuery = buildQuery(AvailableMetrics.COMPLEXITY, complexityNodes)
    override val commentQuery = buildQuery(AvailableMetrics.COMMENT, commentNodes)

}
