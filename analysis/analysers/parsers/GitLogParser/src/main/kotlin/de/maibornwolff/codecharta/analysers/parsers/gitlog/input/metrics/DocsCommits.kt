package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class DocsCommits : Metric {
    private var docsCommitsCount: Long = 0

    override fun description(): String {
        return "Docs Commits: Number of documentation commits (starting with 'docs') for this file."
    }

    override fun metricName(): String {
        return "docs_commits"
    }

    override fun registerCommit(commit: Commit) {
        if (commit.message.trim().startsWith("docs", ignoreCase = true)) {
            docsCommitsCount++
        }
    }

    override fun value(): Number {
        return docsCommitsCount
    }
}
