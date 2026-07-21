package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.util.Logger
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue

class CoroutineFileProcessor : FileProcessor {
    override fun processFilesIndividually(
        files: List<File>,
        basePath: String,
        contentReader: (File) -> String,
        processor: (File, String) -> FileResult,
        onFileProcessed: (() -> Unit)?
    ): FileProcessingResult {
        val fileWordCounts = ConcurrentHashMap<String, Map<String, Int>>()
        val skippedExtensions = ConcurrentHashMap<String, Int>()
        val failedFiles = ConcurrentLinkedQueue<String>()

        runBlocking(Dispatchers.IO) {
            files
                .map { file ->
                    async {
                        val relativePath = file.toRelativeString(File(basePath))
                        try {
                            when (val result = processor(file, contentReader(file))) {
                                is FileResult.Processed -> fileWordCounts[relativePath] = result.words
                                is FileResult.Skipped -> skippedExtensions.merge(result.extension, 1, Int::plus)
                            }
                        } catch (cancellation: CancellationException) {
                            throw cancellation
                        } catch (error: Exception) {
                            failedFiles.add(relativePath)
                            Logger.warn(error) { "Skipping file due to processing error: $relativePath" }
                        }
                        onFileProcessed?.invoke()
                    }
                }.awaitAll()
        }

        return FileProcessingResult(
            perFileWordCounts = fileWordCounts,
            skippedExtensions = skippedExtensions,
            failedFiles = failedFiles.toList()
        )
    }
}
