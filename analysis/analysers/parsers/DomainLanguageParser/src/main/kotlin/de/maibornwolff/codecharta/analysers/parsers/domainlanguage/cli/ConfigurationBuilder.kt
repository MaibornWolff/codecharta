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

class ConfigurationBuilder {
    fun build(parsedArgs: ParsedArguments): AnalysisConfiguration {
        val directory =
            requireNotNull(parsedArgs.directory) {
                "Please provide a directory with -d flag"
            }
        val allowedExtensions = Language.allExtensions()
        val frameworksByPath = detectFrameworks(directory)
        val languageKeywords = buildLanguageKeywords(parsedArgs.excludeTechnicalStopWords, parsedArgs.stopWordLevel)
        val weights = buildExtractionWeights(parsedArgs)
        val customStopWords = loadCustomStopWords(directory)

        return AnalysisConfiguration(
            allowedExtensions = allowedExtensions,
            bypassGitignore = parsedArgs.bypassGitignore,
            excludeTests = parsedArgs.excludeTests,
            languageKeywords = languageKeywords,
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

    private fun detectFrameworks(directory: String): Map<Path, Set<Framework>> = FrameworkDetector().detectFrameworks(Paths.get(directory))

    private fun buildLanguageKeywords(excludeTechnicalStopWords: Boolean, stopWordLevel: StopWordLevel) = buildList {
        addCoreLanguageKeywords()
        addTechnicalStopWordsIfEnabled(excludeTechnicalStopWords, stopWordLevel)
    }

    private fun MutableList<LanguageKeywords>.addCoreLanguageKeywords() {
        add(ResourceKeywords("keywords/java-keywords.txt"))
        add(ResourceKeywords("keywords/kotlin-keywords.txt"))
        add(ResourceKeywords("keywords/typescript-keywords.txt"))
    }

    private fun MutableList<LanguageKeywords>.addTechnicalStopWordsIfEnabled(
        excludeTechnicalStopWords: Boolean,
        stopWordLevel: StopWordLevel
    ) {
        if (!excludeTechnicalStopWords) {
            val stopWords =
                when (stopWordLevel) {
                    StopWordLevel.MINIMAL -> ResourceKeywords("keywords/technical-minimal.txt")
                    StopWordLevel.MODERATE -> ResourceKeywords("keywords/technical-moderate.txt")
                    StopWordLevel.AGGRESSIVE -> ResourceKeywords("keywords/technical-aggressive.txt")
                }
            add(stopWords)
        }
    }

    private fun buildExtractionWeights(parsedArgs: ParsedArguments) = ExtractionWeights(
        identifierWeight = parsedArgs.identifierWeight,
        commentWeight = parsedArgs.commentWeight,
        stringWeight = parsedArgs.stringWeight
    )

    private fun loadCustomStopWords(directory: String): Set<String> {
        val parser = DlcIgnoreParser()
        return parser.loadCustomStopWords(Paths.get(directory))
    }
}
