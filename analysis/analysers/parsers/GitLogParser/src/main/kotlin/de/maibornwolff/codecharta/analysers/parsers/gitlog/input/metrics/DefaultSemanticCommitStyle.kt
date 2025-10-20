package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

object DefaultSemanticCommitStyle {
    private val defaultCommitTypes = listOf(
        SemanticCommitType(
            name = "feat",
            metricName = "feat_commits",
            description = "Feat Commits: Number of feature commits (starting with 'feat') for this file.",
            matchPattern = MatchPattern.StartsWith("feat")
        ),
        SemanticCommitType(
            name = "fix",
            metricName = "fix_commits",
            description = "Fix Commits: Number of bug fix commits (starting with 'fix') for this file.",
            matchPattern = MatchPattern.StartsWith("fix")
        ),
        SemanticCommitType(
            name = "docs",
            metricName = "docs_commits",
            description = "Docs Commits: Number of documentation commits (starting with 'docs') for this file.",
            matchPattern = MatchPattern.StartsWith("docs")
        ),
        SemanticCommitType(
            name = "style",
            metricName = "style_commits",
            description = "Style Commits: Number of style commits (starting with 'style') for this file.",
            matchPattern = MatchPattern.StartsWith("style")
        ),
        SemanticCommitType(
            name = "refactor",
            metricName = "refactor_commits",
            description = "Refactor Commits: Number of refactoring commits (starting with 'refactor') for this file.",
            matchPattern = MatchPattern.StartsWith("refactor")
        ),
        SemanticCommitType(
            name = "test",
            metricName = "test_commits",
            description = "Test Commits: Number of test commits (starting with 'test') for this file.",
            matchPattern = MatchPattern.StartsWith("test")
        ),
        SemanticCommitType(
            name = "hotfix",
            metricName = "hotfix_commits",
            description = "Hotfix Commits: Number of hotfix commits (containing 'hotfix') for this file.",
            matchPattern = MatchPattern.Contains("hotfix")
        )
    )

    fun getAllTypes(): List<SemanticCommitType> {
        return defaultCommitTypes
    }

    fun getTypeByName(name: String): SemanticCommitType? {
        return defaultCommitTypes.find { it.name == name }
    }
}
