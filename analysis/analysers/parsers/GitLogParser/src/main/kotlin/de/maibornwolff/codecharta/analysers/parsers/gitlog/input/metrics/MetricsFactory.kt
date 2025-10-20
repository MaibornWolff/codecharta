package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

class MetricsFactory {
    private val metricFactories: List<() -> Metric>

    constructor() {
        this.metricFactories = createAllMetricFactories()
    }

    constructor(metricNames: List<String>) {
        val allFactories = createAllMetricFactories()
        val sampleMetrics = allFactories.map { it() }
        this.metricFactories = allFactories.filterIndexed { index, _ ->
            metricNames.contains(sampleMetrics[index].metricName())
        }
    }

    private fun createAllMetricFactories(): List<() -> Metric> {
        val commitTypes = DefaultSemanticCommitStyle.getAllTypes()
        val semanticCommitFactories = commitTypes.map { type -> { -> SemanticCommitMetric(type) } }

        val standardFactories = listOf<() -> Metric>(
            { AbsoluteCodeChurn() },
            { AddedLines() },
            { DeletedLines() },
            { NumberOfAuthors() },
            { NumberOfOccurencesInCommits() },
            { RangeOfWeeksWithCommits() },
            { SuccessiveWeeksWithCommits() },
            { WeeksWithCommits() },
            { HighlyCoupledFiles() },
            { MedianCoupledFiles() },
            { AbsoluteCoupledChurn() },
            { AverageCodeChurnPerCommit() },
            { NumberOfRenames() },
            { AgeInWeeks() },
            { SemanticCommitRatio(commitTypes) },
            { HotfixCommits() },
            { HotfixCommitRatio() }
        )

        return standardFactories + semanticCommitFactories
    }

    fun createMetrics(): List<Metric> {
        return metricFactories.map { it() }
    }
}
