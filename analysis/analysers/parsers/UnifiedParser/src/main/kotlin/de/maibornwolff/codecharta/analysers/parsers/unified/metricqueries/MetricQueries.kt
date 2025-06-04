package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries

interface MetricQueries {
    val complexityQuery: String
    val commentQuery: String

    // if a language does not support all metrics, this can be overwritten to only contain the ones the language supports
    fun getAvailableMetrics(): List<AvailableMetrics> {
        return listOf(
            AvailableMetrics.COMPLEXITY,
            AvailableMetrics.COMMENT
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
    COMMENT
}

fun mapNamesToMetrics(metricNames: List<String>): List<AvailableMetrics> {
    val metrics = mutableListOf<AvailableMetrics>()
    if (metricNames.contains("complexity")) metrics.add(AvailableMetrics.COMPLEXITY)
    if (metricNames.contains("comment")) metrics.add(AvailableMetrics.COMMENT)

    return metrics
}
