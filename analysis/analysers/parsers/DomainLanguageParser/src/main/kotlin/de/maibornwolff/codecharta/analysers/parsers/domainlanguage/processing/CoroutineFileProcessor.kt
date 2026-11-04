package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.analyserinterface.failures.FailedFile
import de.maibornwolff.codecharta.util.Logger
import de.maibornwolff.treesitter.excavationsite.api.isUnusableParser
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.ExecutorCoroutineDispatcher
import kotlinx.coroutines.asCoroutineDispatcher
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.Executors
import java.util.concurrent.ThreadFactory
import java.util.concurrent.atomic.AtomicInteger

class CoroutineFileProcessor : FileProcessor {
    override fun processFilesIndividually(
        files: List<File>,
        basePath: String,
        contentReader: (File) -> String,
        processor: (File, String) -> FileResult,
        onFileProcessed: (() -> Unit)?
    ): FileProcessingResult {
        val results = ConcurrentResults()
        val baseFolder = File(basePath)

        // The semaphore bounds how many files are read and held in memory at once
        val inFlight = Semaphore(MAX_FILES_IN_FLIGHT)

        ownThreads().use { dispatcher ->
            runBlocking(dispatcher) {
                files
                    .map { file ->
                        async {
                            val relativePath = file.toRelativeString(baseFolder)
                            recordingFailureOf(relativePath, results) {
                                inFlight.withPermit { results.record(relativePath, processor(file, contentReader(file))) }
                            }
                            onFileProcessed?.invoke()
                        }
                    }.awaitAll()
            }
        }

        return results.toProcessingResult()
    }

    // Tree-sitter parsing is CPU-bound, so one thread per core. Not Dispatchers.Default: under ccsh analyse -p the
    // other parsers fill its queue first, and this parser's files would wait behind all of theirs
    private fun ownThreads(): ExecutorCoroutineDispatcher {
        val threadNumber = AtomicInteger()
        val threadFactory = ThreadFactory { task ->
            Thread(task, "$THREAD_NAME-${threadNumber.incrementAndGet()}").apply { isDaemon = true }
        }
        return Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors(), threadFactory).asCoroutineDispatcher()
    }

    private inline fun recordingFailureOf(relativePath: String, results: ConcurrentResults, process: () -> Unit) {
        try {
            process()
        } catch (cancellation: CancellationException) {
            throw cancellation
        } catch (error: Exception) {
            if (isUnusableParser(error)) throw error
            results.fail(relativePath, error)
        }
    }

    private class ConcurrentResults {
        private val fileWordCounts = ConcurrentHashMap<String, Map<String, Int>>()
        private val skippedExtensions = ConcurrentHashMap<String, Int>()
        private val failedFiles = ConcurrentLinkedQueue<FailedFile>()

        fun record(relativePath: String, result: FileResult) {
            when (result) {
                is FileResult.Processed -> fileWordCounts[relativePath] = result.words
                is FileResult.Skipped -> skippedExtensions.merge(result.extension, 1, Int::plus)
            }
        }

        fun fail(relativePath: String, error: Exception) {
            failedFiles.add(FailedFile(relativePath, error))
            Logger.debug(error) { "Skipping file due to processing error: $relativePath" }
        }

        fun toProcessingResult() = FileProcessingResult(
            perFileWordCounts = fileWordCounts,
            skippedExtensions = skippedExtensions,
            failedFiles = failedFiles.sortedBy { it.path }
        )
    }

    companion object {
        private const val MAX_FILES_IN_FLIGHT = 64
        internal const val THREAD_NAME = "domain-language"
    }
}
