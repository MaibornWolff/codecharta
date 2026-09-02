package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.AnalysisConfiguration
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input.FileScanner
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.CoroutineFileProcessor
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.FileAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.PathScopedKeywordProvider
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.StopWordFilter
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.analysis.TfIdfCalculator
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress.ProgressReporter
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress.SilentProgressReporter

object SourceAnalyzerFactory {
    fun create(config: AnalysisConfiguration, progressReporter: ProgressReporter = SilentProgressReporter): SourceAnalyzer {
        val fileScanner = FileScanner(config.allowedExtensions)
        val pathScopedKeywordProvider = PathScopedKeywordProvider(config.frameworksByPath)
        val stopWordFilter =
            StopWordFilter(
                globalKeywords = config.globalKeywords,
                customStopWords = config.customStopWords,
                pathScopedKeywordProvider = pathScopedKeywordProvider
            )
        val fileAnalyzer =
            FileAnalyzer(
                stopWordFilter = stopWordFilter,
                weights = config.weights,
                ngrams = config.ngrams,
                enableSsr = config.enableSsr
            )

        return SourceAnalyzer(
            config = config,
            fileScanner = fileScanner,
            fileAnalyzer = fileAnalyzer,
            fileProcessor = CoroutineFileProcessor(),
            tfIdfCalculator = TfIdfCalculator(),
            progressReporter = progressReporter
        )
    }
}
