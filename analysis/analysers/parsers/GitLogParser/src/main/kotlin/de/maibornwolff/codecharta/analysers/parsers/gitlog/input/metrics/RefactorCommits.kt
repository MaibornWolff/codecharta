package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit

class RefactorCommits : Metric {
    private var refactorCommitsCount: Long = 0

    override fun description(): String {
        return "Refactor Commits: Number of refactoring commits (starting with 'refactor') for this file."
    }

    override fun metricName(): String {
        return "refactor_commits"
    }

    override fun registerCommit(commit: Commit) {
        if (SemanticCommitDetector.isRefactorCommit(commit.message)) {
            refactorCommitsCount++
        }
    }

    override fun value(): Number {
        return refactorCommitsCount
    }
}
