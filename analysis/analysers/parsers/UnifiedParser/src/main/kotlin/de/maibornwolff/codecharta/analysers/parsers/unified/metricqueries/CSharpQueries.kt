package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

class CSharpQueries : MetricQueries {
    override val complexityNodeTypes = setOf(
        "if_statement",
        "do_statement",
        "foreach_statement",
        "for_statement",
        "while_statement",
        "conditional_expression",
        "is_expression",
        "and_pattern",
        "or_pattern",
        "binary_expression operator: &&",
        "binary_expression operator: ??",
        "binary_expression operator: ||",
        "switch_section",
        "switch_expression_arm",
        "catch_clause",
        "constructor_declaration",
        "method_declaration",
        "lambda_expression",
        "local_function_statement",
        "accessor_declaration"
    )

    override val commentLineNodeTypes = setOf(
        "comment"
    )
}
