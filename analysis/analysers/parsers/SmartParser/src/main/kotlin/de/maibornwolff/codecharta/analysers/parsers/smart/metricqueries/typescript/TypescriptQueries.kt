package de.maibornwolff.codecharta.analysers.parsers.smart.metricqueries.typescript

class TypescriptQueries {

    companion object {
        val complexityQuery =
            """
            (if_statement) @Complexity
            (optional_chain) @Complexity
            (binary_expression operator: "&&") @Complexity
            (binary_expression operator: "||") @Complexity
            (for_statement) @Complexity
            (switch_case) @Complexity
            (function_declaration) @Complexity
            (method_definition) @Complexity
            (function_expression) @Complexity
            (arrow_function) @Complexity
            (while_statement) @Complexity
            (for_in_statement) @Complexity
            (do_statement) @Complexity
            (catch_clause) @Complexity
            (throw_statement) @Complexity
            (ternary_expression) @Complexity
        """.trimIndent()

        // TODO: add more queries for the other metrics
    }


}
