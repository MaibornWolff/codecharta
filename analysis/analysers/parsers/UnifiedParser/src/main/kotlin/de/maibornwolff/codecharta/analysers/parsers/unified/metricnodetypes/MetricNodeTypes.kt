package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

interface MetricNodeTypes {
    val complexityNodeTypes: TreeNodeTypes
    val commentLineNodeTypes: TreeNodeTypes
    // node types for lines_of_code (LOC) is not needed as it is independent of the language
    // node types for real_lines_of_code (RLOC) is also not needed as it counts everything that's not a comment
}

enum class AvailableMetrics(val metricName: String) {
    COMPLEXITY("complexity"),
    COMMENT_LINES("comment_lines"),
    LINES_OF_CODE("loc"),
    REAL_LINES_OF_CODE("rloc")
}

class TreeNodeTypes(
    val simpleNodeTypes: Set<String>,
    val nestedNodeTypes: Set<NestedNodeType>? = null
)

class NestedNodeType(
    val baseNodeType: String,
    val childNodeFieldName: String? = null,
    val childNodeCount: Int? = null,
    val childNodePosition: Int? = null,
    val childNodeTypes: Set<String>
)
