package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis

import de.maibornwolff.codecharta.analysers.analyserinterface.failures.FailedFile
import de.maibornwolff.codecharta.analysers.analyserinterface.failures.FailureReport
import de.maibornwolff.codecharta.analysers.analyserinterface.scan.SourceFileScanner
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.progress.ProgressReporter
import de.maibornwolff.codecharta.util.Logger
import de.maibornwolff.treesitter.excavationsite.api.isUnusableParser
import kotlinx.coroutines.CoroutineDispatcher
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

/** The reports of the files the extraction analysed, and the files it could not analyse. */
class Extraction(val reports: List<FileReport>, val failures: List<FailedFile>)

/**
 * Parses every source file under the analysis root into a [FileReport] of the declarations it contains
 * and the types they use. Nothing is resolved across files here; that is [ProcessingPipeline]'s job.
 */
class ExtractionPipeline(
    private val fileScanner: SourceFileScanner,
    private val progressReporter: ProgressReporter,
    private val maxConcurrency: Int = Runtime.getRuntime().availableProcessors(),
    private val fileTimeoutSeconds: Int = NO_FILE_TIMEOUT,
    private val createAnalyzer: (FileInfo) -> LanguageAnalyzer = LanguageAnalyzerFactory::createAnalyzer,
    private val readContent: (File) -> String = { file -> fileScanner.readContent(file) },
    private val parseDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    /** [input] is a project directory or a single source file; see [analysisRootOf] for what it is judged against. */
    fun run(input: File, bypassGitignore: Boolean): Extraction {
        val sourceFiles = fileScanner.scan(input, useGitignore = !bypassGitignore)
        if (sourceFiles.isEmpty()) {
            Logger.warn { "No supported source files found under ${input.path}" }
            return Extraction(emptyList(), emptyList())
        }
        val analysisRoot = analysisRootOf(input)

        progressReporter.startPhase("Extracting dependencies", sourceFiles.size.toLong())
        val failures = ConcurrentLinkedQueue<FailedFile>()
        val analysedFiles = sourceFiles.mapTo(HashSet()) { relativePathOf(it, analysisRoot) }
        val reports = runBlocking { analyzeInParallel(sourceFiles, AnalysedProject(analysisRoot, analysedFiles), failures) }
        progressReporter.completePhase()
        val sortedFailures = failures.sortedBy { it.path }
        FailureReport.warnAbout(sortedFailures)
        return Extraction(reports, sortedFailures)
    }

    private suspend fun analyzeInParallel(
        sourceFiles: List<File>,
        project: AnalysedProject,
        failures: ConcurrentLinkedQueue<FailedFile>
    ): List<FileReport> = coroutineScope {
        val semaphore = Semaphore(maxConcurrency)
        sourceFiles
            .map { sourceFile -> async { semaphore.withPermit { analyzeOne(sourceFile, project, failures) } } }
            .awaitAll()
            .filterNotNull()
    }

    // A file that fails is left out of the result, and with it its node in the tree, so every failure is
    // collected and reported by its cause once the phase is over; a parser that fits no file stops the run.
    private suspend fun analyzeOne(sourceFile: File, project: AnalysedProject, failures: ConcurrentLinkedQueue<FailedFile>): FileReport? {
        val analysisRoot = project.analysisRoot
        try {
            val fileInfo = toFileInfo(sourceFile, project) ?: return null
            return withOptionalTimeout { createAnalyzer(fileInfo).analyze() }
        } catch (timeout: TimeoutCancellationException) {
            // The parse itself is a blocking native call, so cancelling only abandons the coroutine waiting
            // on it: the parse thread runs to completion in the background and this file is skipped.
            failures.add(FailedFile(relativePathOf(sourceFile, analysisRoot), FileTimeoutException(fileTimeoutSeconds)))
            return null
        } catch (failure: Exception) {
            if (isUnusableParser(failure)) throw failure
            Logger.debug(failure) { "Failed to analyze ${sourceFile.path}: ${failure.message}" }
            failures.add(FailedFile(relativePathOf(sourceFile, analysisRoot), failure))
            return null
        } finally {
            progressReporter.advance()
        }
    }

    private suspend fun <T> withOptionalTimeout(block: () -> T): T = if (fileTimeoutSeconds <= NO_FILE_TIMEOUT) {
        withContext(parseDispatcher) { block() }
    } else {
        withTimeout(fileTimeoutSeconds * MILLIS_PER_SECOND) { withContext(parseDispatcher) { block() } }
    }

    // Only a file of no supported language is no file to analyse; one that cannot be read fails like one that cannot be parsed
    private fun toFileInfo(sourceFile: File, project: AnalysedProject): FileInfo? {
        val language = SupportedLanguage.ofFileName(sourceFile.name) ?: return null
        return FileInfo(
            language = language,
            physicalPath = relativePathOf(sourceFile, project.analysisRoot),
            content = readContent(sourceFile),
            analysisRoot = project.analysisRoot,
            analysedFiles = project.analysedFiles
        )
    }

    private class AnalysedProject(val analysisRoot: File, val analysedFiles: Set<String>)

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

private class FileTimeoutException(seconds: Int) : Exception("Timeout after ${seconds}s")
