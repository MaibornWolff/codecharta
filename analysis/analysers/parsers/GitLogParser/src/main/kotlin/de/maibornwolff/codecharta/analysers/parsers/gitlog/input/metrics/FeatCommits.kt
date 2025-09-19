package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class FeatCommits : Metric {
    private var featCommitsCount: Long = 0

    override fun description(): String {
        return "Feat Commits: Number of feature commits (starting with 'feat') for this file."
    }

    override fun metricName(): String {
        return "feat_commits"
    }

    override fun registerCommit(commit: Commit) {
        if (commit.message.trim().startsWith("feat", ignoreCase = true)) {
            featCommitsCount++
        }
    }

    override fun value(): Number {
        return featCommitsCount
    }
}
