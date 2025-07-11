package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

interface MetricQueries {
    val complexityNodeTypes: Set<String>
    val commentLineNodeTypes: Set<String>
    // node types for lines_of_code (LOC) is not needed as it is independent of the language
    // node types for real_lines_of_code (RLOC) is also not needed as it counts everything that's not a comment
}

enum class AvailableMetrics(val metricName: String) {
    COMPLEXITY("complexity"),
    COMMENT_LINES("comment_lines"),
    LINES_OF_CODE("loc"),
    REAL_LINES_OF_CODE("rloc")
}
