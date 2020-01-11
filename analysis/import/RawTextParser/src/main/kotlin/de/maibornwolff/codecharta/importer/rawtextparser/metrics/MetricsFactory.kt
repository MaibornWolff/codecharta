package de.maibornwolff.codecharta.importer.rawtextparser.metrics

object MetricsFactory {

    fun create(metricList: List<String>, parameters: Map<String, Int>): List<Metric> {
        val metrics = if (metricList.isEmpty()) {
            instantiateAllMetrics()
        } else {
            instantiateAllMetrics().filter { metricList.contains(it.name) }
        }

        metrics.forEach { it.setParameters(parameters) }
        return metrics
    }

    private fun instantiateAllMetrics(): List<Metric> {
        return listOf(
                IndentationCounter()
        )
    }
}