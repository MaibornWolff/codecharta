package de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes

interface MetricNodeTypes {
    val logicComplexityNodeTypes: TreeNodeTypes
    val functionComplexityNodeTypes: TreeNodeTypes
    val commentLineNodeTypes: TreeNodeTypes
    val numberOfFunctionsNodeTypes: TreeNodeTypes
    // node types for lines_of_code (LOC) is not needed as it is independent of the language
    // node types for real_lines_of_code (RLOC) is also not needed as it counts everything that's not a comment
}

// ensure LINES_OF_CODE is always the last entry as we use the enums ordinal and skip calculation for this metric
enum class AvailableMetrics(val metricName: String) {
    COMPLEXITY("complexity"),
    LOGIC_COMPLEXITY("logic_complexity"),
    COMMENT_LINES("comment_lines"),
    NUMBER_OF_FUNCTIONS("number_of_functions"),
    REAL_LINES_OF_CODE("rloc"),
    LINES_OF_CODE("loc")
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
