package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.AnalysisConfiguration
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.SortBy
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input.FileScanner
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.DirectoryWordAggregator
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.DomainAnalysisResult
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.WordFrequency
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.FileAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.FileProcessingResult
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.FileProcessor
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.analysis.TfIdfCalculator
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress.ProgressReporter
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress.SilentProgressReporter
import de.maibornwolff.codecharta.util.Logger
import java.io.File

class SourceAnalyzer(
    private val config: AnalysisConfiguration,
    private val fileScanner: FileScanner,
    private val fileAnalyzer: FileAnalyzer,
    private val fileProcessor: FileProcessor,
    private val tfIdfCalculator: TfIdfCalculator,
    private val progressReporter: ProgressReporter = SilentProgressReporter
) {
    fun analyze(directoryPath: String): DomainAnalysisResult {
        val files = scanFiles(directoryPath)
        val processingResult = processFiles(files, directoryPath)
        fileAnalyzer.releasePerRunCaches()
        val perFileWordCounts = processingResult.perFileWordCounts

        logSkippedFiles(processingResult.skippedExtensions, perFileWordCounts.size)
        logFailedFiles(processingResult.failedFiles)

        val tfidfScores = computeTfidfScores(perFileWordCounts)
        val wordsByPath = buildWordsByPath(perFileWordCounts, tfidfScores, config.limit, config.sortBy)

        return DomainAnalysisResult(filePaths = perFileWordCounts.keys.toList(), wordsByPath = wordsByPath)
    }

    private fun scanFiles(directoryPath: String): List<File> {
        progressReporter.startPhase("Scanning files", total = null)
        val files = fileScanner.scan(directoryPath, config.bypassGitignore, config.excludeTests) { progressReporter.advance() }
        progressReporter.completePhase()
        return files
    }

    private fun processFiles(files: List<File>, directoryPath: String): FileProcessingResult {
        progressReporter.startPhase("Processing files", total = files.size.toLong())
        val processingResult = processFilesIndividually(files, directoryPath) { progressReporter.advance() }
        progressReporter.completePhase()
        return processingResult
    }

    private fun computeTfidfScores(perFileWordCounts: Map<String, Map<String, Int>>): Map<String, Double> {
        if (!config.enableTfidf) return emptyMap()
        if (perFileWordCounts.size < MIN_FILES_FOR_TFIDF) {
            Logger.warn {
                "TF-IDF requires multiple files for meaningful results. Only ${perFileWordCounts.size} file(s) found."
            }
        }
        return tfIdfCalculator.calculate(perFileWordCounts)
    }

    private fun logSkippedFiles(skippedExtensions: Map<String, Int>, processedCount: Int) {
        if (skippedExtensions.isNotEmpty()) {
            val totalSkipped = skippedExtensions.values.sum()
            val extensions = skippedExtensions.keys.sorted().joinToString(", ") { ".$it" }
            Logger.info {
                "Analysis complete: $processedCount files processed, " +
                    "$totalSkipped files skipped (unsupported extensions: $extensions)"
            }
        } else {
            Logger.info { "Analysis complete: $processedCount files processed" }
        }
    }

    private fun logFailedFiles(failedFiles: List<String>) {
        if (failedFiles.isEmpty()) return
        Logger.warn {
            "${failedFiles.size} file(s) dropped due to processing errors: " +
                failedFiles.sorted().joinToString(", ")
        }
    }

    private fun processFilesIndividually(files: List<File>, basePath: String, onFileProcessed: (() -> Unit)? = null): FileProcessingResult =
        fileProcessor.processFilesIndividually(
            files = files,
            basePath = basePath,
            contentReader = { file -> fileScanner.readFileContent(file).getOrThrow() },
            processor = fileAnalyzer::extractWordsFromFile,
            onFileProcessed = onFileProcessed
        )

    private fun buildWordsByPath(
        perFileWordCounts: Map<String, Map<String, Int>>,
        tfidfScores: Map<String, Double>,
        limit: Int?,
        sortBy: SortBy
    ): Map<String, List<WordFrequency>> {
        val fileWords =
            perFileWordCounts.mapValues { (_, wordCounts) ->
                val frequencies =
                    wordCounts.map { (word, count) ->
                        WordFrequency.withScore(word, count, tfidfScores)
                    }
                sortAndLimit(frequencies, sortBy, limit)
            }

        // Aggregates the per-file words up to every ancestor directory and the root ".".
        val wordsPerPath = DirectoryWordAggregator.aggregateDirectories(fileWords, tfidfScores)

        return wordsPerPath.mapValues { (_, words) -> sortAndLimit(words, sortBy, limit) }
    }

    private fun sortAndLimit(frequencies: List<WordFrequency>, sortBy: SortBy, limit: Int?): List<WordFrequency> {
        val sorted = sortWordFrequencies(frequencies, sortBy)
        return if (limit != null) sorted.take(limit) else sorted
    }

    // `text` ascending is the deterministic tie-break so equal-ranked words keep a stable order and the
    // emitted cc.json stays reproducible across runs.
    private fun sortWordFrequencies(frequencies: List<WordFrequency>, sortBy: SortBy): List<WordFrequency> = when (sortBy) {
        SortBy.FREQUENCY -> frequencies.sortedWith(compareByDescending<WordFrequency> { it.frequency }.thenBy { it.text })
        SortBy.TFIDF -> frequencies.sortedWith(compareByDescending<WordFrequency> { it.tfidf ?: 0.0 }.thenBy { it.text })
    }

    companion object {
        // TF-IDF is undefined for a single document — IDF has no spread to measure — so below this
        // the scoring is skipped entirely and only a warning is emitted.
        private const val MIN_FILES_FOR_TFIDF = 2
    }
}
