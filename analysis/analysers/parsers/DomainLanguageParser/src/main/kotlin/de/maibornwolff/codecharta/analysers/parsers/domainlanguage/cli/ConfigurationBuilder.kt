package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.ExtractionWeights
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Framework
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.FrameworkDetector
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Language
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.LanguageKeywords
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.stopwords.DlcIgnoreParser
import java.nio.file.Path
import java.nio.file.Paths

class ConfigurationBuilder(
    private val frameworkDetector: FrameworkDetector = FrameworkDetector(),
    private val dlcIgnoreParser: DlcIgnoreParser = DlcIgnoreParser()
) {
    fun build(parsedArgs: ParsedArguments): AnalysisConfiguration {
        val directory =
            requireNotNull(parsedArgs.directory) {
                "Please provide a directory with -d flag"
            }
        val allowedExtensions = Language.allExtensions()
        val frameworksByPath = detectFrameworks(directory)
        val globalKeywords = buildGlobalKeywords(parsedArgs.noTechnicalStopWords, parsedArgs.stopWordLevel)
        val weights = buildExtractionWeights(parsedArgs)
        val customStopWords = loadCustomStopWords(directory)

        return AnalysisConfiguration(
            allowedExtensions = allowedExtensions,
            bypassGitignore = parsedArgs.bypassGitignore,
            excludeTests = parsedArgs.excludeTests,
            globalKeywords = globalKeywords,
            weights = weights,
            ngrams = parsedArgs.ngrams,
            customStopWords = customStopWords,
            frameworksByPath = frameworksByPath,
            enableSsr = !parsedArgs.noSsr,
            limit = parsedArgs.limit,
            enableTfidf = !parsedArgs.noTfidf,
            sortBy = parsedArgs.sortBy
        )
    }

    private fun detectFrameworks(directory: String): Map<Path, Set<Framework>> = frameworkDetector.detectFrameworks(Paths.get(directory))

    // Only the technical stop words are global. Per-language keywords are scoped to the files of that
    // language by `StopWordFilter`, so a Go file's `func` does not disappear from a Kotlin one.
    private fun buildGlobalKeywords(noTechnicalStopWords: Boolean, stopWordLevel: StopWordLevel): List<LanguageKeywords> {
        if (noTechnicalStopWords) return emptyList()
        return listOf(technicalStopWordsFor(stopWordLevel))
    }

    private fun technicalStopWordsFor(stopWordLevel: StopWordLevel): LanguageKeywords = when (stopWordLevel) {
        StopWordLevel.MINIMAL -> ResourceKeywords("keywords/technical-minimal.txt")
        StopWordLevel.MODERATE -> ResourceKeywords("keywords/technical-moderate.txt")
        StopWordLevel.AGGRESSIVE -> ResourceKeywords("keywords/technical-aggressive.txt")
    }

    private fun buildExtractionWeights(parsedArgs: ParsedArguments) = ExtractionWeights(
        identifierWeight = parsedArgs.identifierWeight,
        commentWeight = parsedArgs.commentWeight,
        stringWeight = parsedArgs.stringWeight
    )

    private fun loadCustomStopWords(directory: String): Set<String> = dlcIgnoreParser.loadCustomStopWords(Paths.get(directory))
}
