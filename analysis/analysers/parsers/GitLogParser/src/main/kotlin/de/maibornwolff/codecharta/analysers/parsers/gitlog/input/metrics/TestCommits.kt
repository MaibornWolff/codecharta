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
        if (commit.message.trim().startsWith("test", ignoreCase = true)) {
            testCommitsCount++
        }
    }

    override fun value(): Number {
        return testCommitsCount
    }
}
