package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzerFactory
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.FileScanner
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

/**
 * Parses every source file under the analysis root into a [FileReport] of the declarations it contains
 * and the types they use. Nothing is resolved across files here; that is [ProcessingPipeline]'s job.
 */
class ExtractionPipeline(
    private val fileScanner: FileScanner,
    private val progressReporter: ProgressReporter,
    private val maxConcurrency: Int = Runtime.getRuntime().availableProcessors(),
    private val fileTimeoutSeconds: Int = NO_FILE_TIMEOUT
) {
    /** [input] is a project directory or a single source file; see [analysisRootOf] for what it is judged against. */
    fun run(input: File, bypassGitignore: Boolean): List<FileReport> {
        val sourceFiles = fileScanner.scan(input.path, bypassGitignore)
        if (sourceFiles.isEmpty()) {
            Logger.warn { "No supported source files found under ${input.path}" }
            return emptyList()
        }
        val analysisRoot = analysisRootOf(input)

        progressReporter.startPhase("Extracting dependencies", sourceFiles.size.toLong())
        val reports = runBlocking { analyzeInParallel(sourceFiles, analysisRoot) }
        progressReporter.completePhase()
        return reports
    }

    private suspend fun analyzeInParallel(sourceFiles: List<File>, analysisRoot: File): List<FileReport> = coroutineScope {
        val semaphore = Semaphore(maxConcurrency)
        sourceFiles
            .map { sourceFile -> async { semaphore.withPermit { analyzeOne(sourceFile, analysisRoot) } } }
            .awaitAll()
            .filterNotNull()
    }

    private suspend fun analyzeOne(sourceFile: File, analysisRoot: File): FileReport? {
        try {
            val fileInfo = toFileInfo(sourceFile, analysisRoot) ?: return null
            return withOptionalTimeout { LanguageAnalyzerFactory.createAnalyzer(fileInfo).analyze() }
        } catch (timeout: TimeoutCancellationException) {
            // The parse itself is a blocking JNI call, so cancelling only abandons the coroutine waiting
            // on it: the parse thread runs to completion in the background and this file is skipped.
            Logger.warn(timeout) { "Timeout after ${fileTimeoutSeconds}s analyzing ${sourceFile.path}; skipping it" }
            return null
        } catch (failure: Exception) {
            Logger.debug { "Failed to analyze ${sourceFile.path}: ${failure.message}" }
            return null
        } finally {
            progressReporter.advance()
        }
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
    }
}
