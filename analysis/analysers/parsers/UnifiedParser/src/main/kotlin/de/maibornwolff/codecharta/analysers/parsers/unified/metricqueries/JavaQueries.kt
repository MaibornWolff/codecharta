package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class JavaQueries : MetricQueries {
    override val complexityNodeTypes = setOf(
        "if_statement",
        "do_statement",
        "for_statement",
        "while_statement",
        "enhanced_for_statement",
        "ternary_expression",
        "binary_expression operator: &&",
        "binary_expression operator: ||",
        "switch_label",
        "catch_clause",
        "constructor_declaration",
        "method_declaration",
        "lambda_expression",
        "static_initializer",
        "compact_constructor_declaration"
    )

    override val commentLineNodeTypes = setOf(
        "block_comment",
        "line_comment"
    )
}
