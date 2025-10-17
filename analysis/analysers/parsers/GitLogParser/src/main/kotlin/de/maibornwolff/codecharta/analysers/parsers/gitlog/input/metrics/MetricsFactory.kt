package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

class MetricsFactory {
    private val metricClasses: List<Class<out Metric>>

    constructor() {
        this.metricClasses = createAllMetrics().map { it.javaClass }
    }

    constructor(metricNames: List<String>) {
        this.metricClasses =
            createAllMetrics().filter { m -> metricNames.contains(m.metricName()) }.map { it.javaClass }
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
            AgeInWeeks(),
            SemanticCommitMetric("feat", "Feat Commits: Number of feature commits (starting with 'feat') for this file.", SemanticCommitDetector::isFeatCommit),
            SemanticCommitMetric("fix", "Fix Commits: Number of bug fix commits (starting with 'fix') for this file.", SemanticCommitDetector::isFixCommit),
            SemanticCommitMetric("docs", "Docs Commits: Number of documentation commits (starting with 'docs') for this file.", SemanticCommitDetector::isDocsCommit),
            SemanticCommitMetric("style", "Style Commits: Number of code style commits (starting with 'style') for this file.", SemanticCommitDetector::isStyleCommit),
            SemanticCommitMetric("refactor", "Refactor Commits: Number of refactoring commits (starting with 'refactor') for this file.", SemanticCommitDetector::isRefactorCommit),
            SemanticCommitMetric("test", "Test Commits: Number of test commits (starting with 'test') for this file.", SemanticCommitDetector::isTestCommit),
            SemanticCommitMetric("hotfix", "Hotfix Commits: Number of hotfix commits (containing 'hotfix' keyword) for this file.", SemanticCommitDetector::isHotfixCommit),
            SemanticCommitRatio(),
            HotfixCommitRatio()
        )
    }

    fun createMetrics(): List<Metric> {
        return metricClasses.map { createMetric(it) }
    }
}
