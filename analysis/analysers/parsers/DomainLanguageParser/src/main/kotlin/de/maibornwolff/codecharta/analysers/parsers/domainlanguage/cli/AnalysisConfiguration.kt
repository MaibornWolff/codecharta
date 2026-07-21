package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.ExtractionWeights
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Framework
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.LanguageKeywords
import java.nio.file.Path

data class AnalysisConfiguration(
    // File scanning settings
    val allowedExtensions: List<String>,
    val bypassGitignore: Boolean = false,
    val excludeTests: Boolean = false,
    // Pipeline settings
    val languageKeywords: List<LanguageKeywords> = emptyList(),
    val weights: ExtractionWeights = ExtractionWeights(),
    val ngrams: Int = 1,
    val customStopWords: Set<String> = emptySet(),
    val frameworksByPath: Map<Path, Set<Framework>> = emptyMap(),
    val enableSsr: Boolean = true,
    // Output settings
    val limit: Int? = null,
    val enableTfidf: Boolean = true,
    val sortBy: SortBy = SortBy.FREQUENCY
) {
    init {
        require(allowedExtensions.isNotEmpty()) { "At least one file extension must be specified" }
        require(ngrams >= 1) { "ngrams must be at least 1, got $ngrams" }
        require(allowedExtensions.all { it.isNotBlank() }) { "Extensions cannot be blank" }
    }
}
