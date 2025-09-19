package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class StyleCommits : Metric {
    private var styleCommitsCount: Long = 0

    override fun description(): String {
        return "Style Commits: Number of code style commits (starting with 'style') for this file."
    }

    override fun metricName(): String {
        return "style_commits"
    }

    override fun registerCommit(commit: Commit) {
        if (commit.message.trim().startsWith("style", ignoreCase = true)) {
            styleCommitsCount++
        }
    }

    override fun value(): Number {
        return styleCommitsCount
    }
}
