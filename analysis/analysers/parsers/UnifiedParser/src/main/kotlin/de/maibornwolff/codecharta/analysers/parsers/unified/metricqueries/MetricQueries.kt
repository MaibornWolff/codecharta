package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

interface MetricQueries {
    val complexityQuery: String
    val commentLinesQuery: String

    // if a language does not support all metrics, this can be overwritten to only contain the ones the language supports
    fun getAvailableMetrics(): List<AvailableMetrics> {
        return listOf(
            AvailableMetrics.COMPLEXITY,
            AvailableMetrics.COMMENT_LINES
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
    COMMENT_LINES
}

fun mapNamesToMetrics(metricNames: List<String>): List<AvailableMetrics> {
    val metrics = mutableListOf<AvailableMetrics>()
    if (metricNames.contains("complexity")) metrics.add(AvailableMetrics.COMPLEXITY)
    if (metricNames.contains("comment_lines")) metrics.add(AvailableMetrics.COMMENT_LINES)

    return metrics
}
