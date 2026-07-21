package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli

data class ParsedArguments(
    val directory: String?,
    val limit: Int?,
    val bypassGitignore: Boolean,
    val excludeTests: Boolean,
    val identifierWeight: Int,
    val commentWeight: Int,
    val stringWeight: Int,
    val excludeTechnicalStopWords: Boolean,
    val stopWordLevel: StopWordLevel,
    val ngrams: Int,
    val noTfidf: Boolean = false,
    val sortBy: SortBy = SortBy.FREQUENCY,
    val noSsr: Boolean = false
)
