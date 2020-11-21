package de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics

class MetricsFactory {

    private val metricClasses: List<Class<out Metric>>

    constructor() {
        this.metricClasses = createAllMetrics()
            .map { it.javaClass }
    }

    constructor(metricNames: List<String>) {
        this.metricClasses = createAllMetrics()
            .filter { m -> metricNames.contains(m.metricName()) }
            .map { it.javaClass }
    }

    private fun createMetric(clazz: Class<out Metric>): Metric {
        try {
            return clazz.getDeclaredConstructor().newInstance()
        } catch (e: InstantiationException) {
            throw IllegalArgumentException("metric $clazz not found.")
        } catch (e: IllegalAccessException) {
            throw IllegalArgumentException("metric $clazz not found.")
        }
    }

    private fun createAllMetrics(): List<Metric> {
        return listOf(
            AbsoluteCodeChurn(),
            AddedLines(),
            DeletedLines(),
            NumberOfAuthors(),
            NumberOfOccurencesInCommits(),
            RangeOfWeeksWithCommits(),
            SuccessiveWeeksWithCommits(),
            WeeksWithCommits(),
            HighlyCoupledFiles(),
            MedianCoupledFiles(),
            AbsoluteCoupledChurn(),
            AverageCodeChurnPerCommit(),
            NumberOfRenames(),
            AgeInWeeks()
        )
    }

    fun createMetrics(): List<Metric> {
        return metricClasses
            .map { createMetric(it) }
    }
}
