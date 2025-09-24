package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class FixCommits : Metric {
    private var fixCommitsCount: Long = 0

    override fun description(): String {
        return "Fix Commits: Number of bug fix commits (starting with 'fix') for this file."
    }

    override fun metricName(): String {
        return "fix_commits"
    }

    override fun registerCommit(commit: Commit) {
        if (SemanticCommitDetector.isFixCommit(commit.message)) {
            fixCommitsCount++
        }
    }

    override fun value(): Number {
        return fixCommitsCount
    }
}
