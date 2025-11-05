package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

data class SemanticCommitType(
    val name: String,
    val metricName: String,
    val description: String,
    val matchPattern: MatchPattern
)
