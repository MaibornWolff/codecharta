package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.typescript

class TypescriptQueries : MetricQueries {
    companion object {
//        val complexityQuery =
//            """
//            (if_statement) @Complexity
//            (optional_chain) @Complexity
//            (binary_expression operator: "&&") @Complexity
//            (binary_expression operator: "||") @Complexity
//            (for_statement) @Complexity
//            (switch_case) @Complexity
//            (function_declaration) @Complexity
//            (method_definition) @Complexity
//            (function_expression) @Complexity
//            (arrow_function) @Complexity
//            (while_statement) @Complexity
//            (for_in_statement) @Complexity
//            (do_statement) @Complexity
//            (catch_clause) @Complexity
//            (throw_statement) @Complexity
//            (ternary_expression) @Complexity
//            """.trimIndent()


        // TODO: add more queries for the other metrics

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
            "ternary_expression",
        )

        val complexityQuery = getQuery("Complexity", complexityNodes)

        private fun getQuery(metric: String, includedNodes: List<String>): String {
            var result = ""
            for (node in includedNodes) {
                result += "($node) @$metric\n"
            }
            return result
        }
    }

    override val complexityQuery = getQuery("Complexity", complexityNodes)
}
