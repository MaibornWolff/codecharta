package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class HotfixCommits : Metric {
    private var hotfixCommitsCount: Long = 0

    override fun description(): String {
        return "Hotfix Commits: Number of hotfix commits (containing 'hotfix' keyword) for this file."
    }

    override fun metricName(): String {
        return "hotfix_commits"
    }

    override fun registerCommit(commit: Commit) {
        if (commit.message.contains("hotfix", ignoreCase = true)) {
            hotfixCommitsCount++
        }
    }

    override fun value(): Number {
        return hotfixCommitsCount
    }
}
