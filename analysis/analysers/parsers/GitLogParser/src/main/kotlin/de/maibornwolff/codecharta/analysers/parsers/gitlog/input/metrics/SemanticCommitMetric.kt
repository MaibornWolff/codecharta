package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class SemanticCommitMetric(private val commitType: SemanticCommitType) : Metric {
    private var commitCount: Long = 0

    override fun description(): String {
        return commitType.description
    }

    override fun metricName(): String {
        return commitType.metricName
    }

    override fun registerCommit(commit: Commit) {
        if (commitType.matchPattern.matches(commit.message)) {
            commitCount++
        }
    }

    override fun value(): Number {
        return commitCount
    }
}
