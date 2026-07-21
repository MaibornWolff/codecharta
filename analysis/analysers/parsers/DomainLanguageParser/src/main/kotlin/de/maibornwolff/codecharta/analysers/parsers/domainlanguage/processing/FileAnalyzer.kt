package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.SourceCodePipeline
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * Analyzes source code files and extracts word frequencies.
 *
 * Dispatches on [Language], which is the source of truth for the supported extensions.
 * Unsupported file types return [FileResult.Skipped] with the extension.
 *
 * Framework-specific keywords are filtered based on the file's location
 * relative to detected framework directories.
 */
class FileAnalyzer(
    private val stopWordFilter: StopWordFilter,
    private val weights: ExtractionWeights = ExtractionWeights(),
    private val ngrams: Int = 1,
    private val enableSsr: Boolean = true
) {
    private val pipelines = ConcurrentHashMap<Language, SourceCodePipeline>()

    private fun getPipeline(language: Language): SourceCodePipeline = pipelines.computeIfAbsent(language) {
        SourceCodePipeline(language, weights, ngrams, stopWordFilter, enableSsr)
    }

    fun extractWordsFromFile(file: File, content: String): FileResult {
        val language =
            Language.fromExtension(file.extension)
                ?: return FileResult.Skipped(file.extension.lowercase())
        val filePath = file.toPath().toAbsolutePath()
        val words = getPipeline(language).process(content, filePath)
        return FileResult.Processed(words)
    }

    /** Releases the caches that are only valid for one analysis run. The pipeline map is enum-bounded and kept. */
    fun releasePerRunCaches() {
        stopWordFilter.clearCache()
    }
}
