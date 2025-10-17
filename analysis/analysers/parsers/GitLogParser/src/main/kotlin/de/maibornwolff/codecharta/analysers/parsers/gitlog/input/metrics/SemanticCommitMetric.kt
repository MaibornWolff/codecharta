package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class SemanticCommitMetric(
    private val commitType: String,
    private val commitDescription: String,
    private val detector: (String) -> Boolean
) : Metric {
    private var commitCount: Long = 0

    override fun description(): String {
        return commitDescription
    }

    override fun metricName(): String {
        return "${commitType}_commits"
    }

    override fun registerCommit(commit: Commit) {
        if (detector(commit.message)) {
            commitCount++
        }
    }

    override fun value(): Number {
        return commitCount
    }
}
