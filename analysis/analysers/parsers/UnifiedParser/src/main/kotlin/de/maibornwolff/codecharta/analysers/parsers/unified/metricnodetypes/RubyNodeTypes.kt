package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

class RubyNodeTypes : MetricNodeTypes {
    override val complexityNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            // if
            "if",
            "elsif",
            // loop
            "for",
            "until",
            "while",
            "do_block",
            // case
            "when",
            "else",
            // catch
            "rescue",
            // function
            "lambda",
            "method",
            "singleton_method"
        ),
        nestedNodeTypes = setOf(
            // logical binary
            NestedNodeType(
                baseNodeType = "binary",
                childNodeFieldName = "operator",
                childNodeTypes = setOf("&&", "||", "and", "or")
            )
        )
    )

    override val commentLineNodeTypes = TreeNodeTypes(
        simpleNodeTypes = setOf(
            "comment"
        )
    )
}
