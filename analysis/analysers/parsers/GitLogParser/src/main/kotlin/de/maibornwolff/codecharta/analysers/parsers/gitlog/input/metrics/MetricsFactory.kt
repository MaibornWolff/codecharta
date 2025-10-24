package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

data class MetricDefinition(
    val metricName: String,
    val factory: () -> Metric
)

class MetricsFactory(requestedMetrics: List<String> = emptyList()) {
    private val metricDefinitions = createAllDefinitions().selectMetrics(requestedMetrics)

    fun createMetrics(): List<Metric> = metricDefinitions.map { it.factory() }

    private fun createAllDefinitions(): List<MetricDefinition> {
        val commitTypes = DefaultSemanticCommitStyle.getAllTypes()
        val standard = createStandardDefinitions(commitTypes)
        val dynamic = createCommitTypeDefinitions(commitTypes)
        return standard + dynamic
    }

    private fun createStandardDefinitions(commitTypes: List<SemanticCommitType>): List<MetricDefinition> = listOf(
        MetricDefinition("abs_code_churn", { AbsoluteCodeChurn() }),
        MetricDefinition("added_lines", { AddedLines() }),
        MetricDefinition("deleted_lines", { DeletedLines() }),
        MetricDefinition("number_of_authors", { NumberOfAuthors() }),
        MetricDefinition("number_of_commits", { NumberOfOccurencesInCommits() }),
        MetricDefinition("range_of_weeks_with_commits", { RangeOfWeeksWithCommits() }),
        MetricDefinition("successive_weeks_with_commits", { SuccessiveWeeksWithCommits() }),
        MetricDefinition("weeks_with_commits", { WeeksWithCommits() }),
        MetricDefinition("highly_coupled_files", { HighlyCoupledFiles() }),
        MetricDefinition("median_coupled_files", { MedianCoupledFiles() }),
        MetricDefinition("abs_coupled_churn", { AbsoluteCoupledChurn() }),
        MetricDefinition("avg_code_churn", { AverageCodeChurnPerCommit() }),
        MetricDefinition("number_of_renames", { NumberOfRenames() }),
        MetricDefinition("age_in_weeks", { AgeInWeeks() }),
        MetricDefinition("semantic_commit_ratio", { SemanticCommitRatio(commitTypes) }),
        MetricDefinition("hotfix_commits", { HotfixCommits() }),
        MetricDefinition("hotfix_commit_ratio", { HotfixCommitRatio() })
    )

    private fun createCommitTypeDefinitions(commitTypes: List<SemanticCommitType>): List<MetricDefinition> = commitTypes.map { type ->
        MetricDefinition(type.metricName, { SemanticCommitMetric(type) })
    }

    private fun List<MetricDefinition>.selectMetrics(names: List<String>): List<MetricDefinition> {
        if (names.isEmpty()) {
            return this
        }
        return filter { it.metricName in names }
    }
}
