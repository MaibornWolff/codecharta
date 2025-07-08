package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

interface MetricQueries {
    val complexityNodeTypes: Set<String>
    val commentLineNodeTypes: Set<String>
    // node types for lines_of_code (LOC) is not needed as it is independent of the language
    // node types for real_lines_of_code (RLOC) is also not needed as it counts everything thats not a comment

    // if a language does not support all metrics, this can be overwritten to only contain the ones the language supports
    fun getAvailableMetrics(): List<AvailableMetrics> {
        return listOf(
            AvailableMetrics.COMPLEXITY,
            AvailableMetrics.COMMENT_LINES,
            AvailableMetrics.LOC,
            AvailableMetrics.RLOC
        )
    }
}

enum class AvailableMetrics {
    COMPLEXITY,
    COMMENT_LINES,
    LOC,
    RLOC
}

fun mapNamesToMetrics(metricNames: List<String>): List<AvailableMetrics> {
    val metrics = mutableListOf<AvailableMetrics>()
    if (metricNames.contains("complexity")) metrics.add(AvailableMetrics.COMPLEXITY)
    if (metricNames.contains("comment_lines")) metrics.add(AvailableMetrics.COMMENT_LINES)
    if (metricNames.contains("loc")) metrics.add(AvailableMetrics.LOC)
    if (metricNames.contains("rloc")) metrics.add(AvailableMetrics.RLOC)

    return metrics
}
