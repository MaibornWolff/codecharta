package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis

import de.maibornwolff.codecharta.analysers.analyserinterface.scan.SourceFileScanner
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzerFactory
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.progress.ProgressReporter
import de.maibornwolff.codecharta.util.Logger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.io.File
import java.util.concurrent.ConcurrentLinkedQueue

/**
 * Parses every source file under the analysis root into a [FileReport] of the declarations it contains
 * and the types they use. Nothing is resolved across files here; that is [ProcessingPipeline]'s job.
 */
class ExtractionPipeline(
    private val fileScanner: SourceFileScanner,
    private val progressReporter: ProgressReporter,
    private val maxConcurrency: Int = Runtime.getRuntime().availableProcessors(),
    private val fileTimeoutSeconds: Int = NO_FILE_TIMEOUT,
    private val createAnalyzer: (FileInfo) -> LanguageAnalyzer = LanguageAnalyzerFactory::createAnalyzer
) {
    /** [input] is a project directory or a single source file; see [analysisRootOf] for what it is judged against. */
    fun run(input: File, bypassGitignore: Boolean): List<FileReport> {
        val sourceFiles = fileScanner.scan(input, useGitignore = !bypassGitignore)
        if (sourceFiles.isEmpty()) {
            Logger.warn { "No supported source files found under ${input.path}" }
            return emptyList()
        }
        val analysisRoot = analysisRootOf(input)

        progressReporter.startPhase("Extracting dependencies", sourceFiles.size.toLong())
        val skippedFiles = ConcurrentLinkedQueue<String>()
        val reports = runBlocking { analyzeInParallel(sourceFiles, analysisRoot, skippedFiles) }
        progressReporter.completePhase()
        warnAboutSkippedFiles(skippedFiles.toList())
        return reports
    }

    private suspend fun analyzeInParallel(
        sourceFiles: List<File>,
        analysisRoot: File,
        skippedFiles: ConcurrentLinkedQueue<String>
    ): List<FileReport> = coroutineScope {
        val semaphore = Semaphore(maxConcurrency)
        sourceFiles
            .map { sourceFile -> async { semaphore.withPermit { analyzeOne(sourceFile, analysisRoot, skippedFiles) } } }
            .awaitAll()
            .filterNotNull()
    }

    // A file that fails is left out of the result, and with it its node in the tree, so every skip is
    // collected and reported once the phase is over: the per-file cause is only logged at debug level.
    private suspend fun analyzeOne(sourceFile: File, analysisRoot: File, skippedFiles: ConcurrentLinkedQueue<String>): FileReport? {
        try {
            val fileInfo = toFileInfo(sourceFile, analysisRoot) ?: return null
            return withOptionalTimeout { createAnalyzer(fileInfo).analyze() }
        } catch (timeout: TimeoutCancellationException) {
            // The parse itself is a blocking JNI call, so cancelling only abandons the coroutine waiting
            // on it: the parse thread runs to completion in the background and this file is skipped.
            Logger.warn { "Timeout after ${fileTimeoutSeconds}s analyzing ${sourceFile.path}; skipping it" }
            skippedFiles.add(sourceFile.path)
            return null
        } catch (failure: Exception) {
            Logger.debug(failure) { "Failed to analyze ${sourceFile.path}: ${failure.message}" }
            skippedFiles.add(sourceFile.path)
            return null
        } finally {
            progressReporter.advance()
        }
    }

    private fun warnAboutSkippedFiles(skippedFiles: List<String>) {
        if (skippedFiles.isEmpty()) return
        val listed = skippedFiles.take(MAX_LISTED_SKIPPED_FILES).joinToString()
        val unlisted = skippedFiles.size - MAX_LISTED_SKIPPED_FILES
        val andMore = if (unlisted > 0) " and $unlisted more" else ""
        Logger.warn { "${skippedFiles.size} file(s) could not be analysed and are missing from the output: $listed$andMore" }
    }

    private suspend fun <T> withOptionalTimeout(block: () -> T): T = if (fileTimeoutSeconds <= NO_FILE_TIMEOUT) {
        withContext(Dispatchers.IO) { block() }
    } else {
        withTimeout(fileTimeoutSeconds * MILLIS_PER_SECOND) { withContext(Dispatchers.IO) { block() } }
    }

    private fun toFileInfo(sourceFile: File, analysisRoot: File): FileInfo? {
        val language = SupportedLanguage.ofFileName(sourceFile.name) ?: return null
        val content = fileScanner.readFileContent(sourceFile).getOrNull() ?: return null
        return FileInfo(
            language = language,
            physicalPath = relativePathOf(sourceFile, analysisRoot),
            content = content,
            analysisRoot = analysisRoot
        )
    }

    private fun relativePathOf(sourceFile: File, analysisRoot: File): String =
        sourceFile.absoluteFile.toRelativeString(analysisRoot.absoluteFile)

    companion object {
        const val NO_FILE_TIMEOUT = 0

        /**
         * A single file is a legal input, but the directory around it still defines the analysis: tsconfig
         * and bundler configs are looked up from it, and the paths nodes are keyed by are relative to it.
         */
        fun analysisRootOf(input: File): File = if (input.isFile) input.absoluteFile.parentFile else input

        private const val MILLIS_PER_SECOND = 1000L
        private const val MAX_LISTED_SKIPPED_FILES = 5
    }
}
