package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class HotfixCommits : Metric {
    private var count: Long = 0

    override fun description(): String {
        return "Hotfix Commits: Number of hotfix commits (containing 'hotfix') for this file."
    }

    override fun metricName(): String {
        return "hotfix_commits"
    }

    override fun registerCommit(commit: Commit) {
        if (commit.message.contains("hotfix", ignoreCase = true)) {
            count++
        }
    }

    override fun value(): Number {
        return count
    }
}
