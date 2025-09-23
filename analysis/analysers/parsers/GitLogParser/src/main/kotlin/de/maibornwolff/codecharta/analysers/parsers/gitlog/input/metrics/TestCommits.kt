package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class TestCommits : Metric {
    private var testCommitsCount: Long = 0

    override fun description(): String {
        return "Test Commits: Number of test commits (starting with 'test') for this file."
    }

    override fun metricName(): String {
        return "test_commits"
    }

    override fun registerCommit(commit: Commit) {
        if (SemanticCommitDetector.isTestCommit(commit.message)) {
            testCommitsCount++
        }
    }

    override fun value(): Number {
        return testCommitsCount
    }
}
