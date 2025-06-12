package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

interface MetricQueries {
    val complexityQuery: String
    val commentLinesQuery: String
    // a query for lines_of_code (LOC) is not needed as it is independent of the language

    // if a language does not support all metrics, this can be overwritten to only contain the ones the language supports
    fun getAvailableMetrics(): List<AvailableMetrics> {
        return listOf(
            AvailableMetrics.COMPLEXITY,
            AvailableMetrics.COMMENT_LINES,
            AvailableMetrics.LOC
        )
    }

    fun buildQuery(metric: AvailableMetrics, includedNodes: List<String>): String {
        var result = ""
        for (node in includedNodes) {
            result += "($node) @${metric.name}\n"
        }
        return result
    }
}

enum class AvailableMetrics {
    COMPLEXITY,
    COMMENT_LINES,
    LOC
}

fun mapNamesToMetrics(metricNames: List<String>): List<AvailableMetrics> {
    val metrics = mutableListOf<AvailableMetrics>()
    if (metricNames.contains("complexity")) metrics.add(AvailableMetrics.COMPLEXITY)
    if (metricNames.contains("comment_lines")) metrics.add(AvailableMetrics.COMMENT_LINES)
    if (metricNames.contains("loc")) metrics.add(AvailableMetrics.LOC)

    return metrics
}
