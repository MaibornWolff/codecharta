package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import java.io.File

data class FileProcessingResult(
    val perFileWordCounts: Map<String, Map<String, Int>>,
    val skippedExtensions: Map<String, Int>,
    val failedFiles: List<String> = emptyList()
)

interface FileProcessor {
    fun processFilesIndividually(
        files: List<File>,
        basePath: String,
        contentReader: (File) -> String,
        processor: (File, String) -> FileResult,
        onFileProcessed: (() -> Unit)? = null
    ): FileProcessingResult
}
