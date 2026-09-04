package de.maibornwolff.codecharta.analysers.parsers.dependency.input

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignoreHandler
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.nio.charset.Charset

class FileScanner(
    private val allowedExtensions: List<String>,
    private val maxFileSizeKb: Int = NO_FILE_SIZE_LIMIT,
    private val excludeTests: Boolean = true
) {
    private val fileFilter = FileFilter(allowedExtensions)
    private val testFileDetector = TestFileDetector()

    fun scan(inputPath: String, bypassGitignore: Boolean = false, onFileFound: (() -> Unit)? = null): List<File> {
        val input = File(inputPath)
        if (!input.exists()) {
            Logger.warn { "Input does not exist: $inputPath" }
            return emptyList()
        }
        if (input.isFile) {
            return scanSingleFile(input, onFileFound)
        }

        return if (bypassGitignore) {
            scanWithoutGitignore(input, onFileFound)
        } else {
            scanWithGitignore(input, onFileFound)
        }
    }

    private fun scanSingleFile(file: File, onFileFound: (() -> Unit)?): List<File> {
        if (!isAnalysable(file)) return emptyList()
        onFileFound?.invoke()
        return listOf(file)
    }

    private fun isAnalysable(file: File): Boolean = fileFilter.matchesExtension(file) &&
        !isGenerated(file) &&
        !exceedsFileSizeLimit(file) &&
        (!excludeTests || !testFileDetector.isTestFile(file))

    // A minified bundle declares nothing a reader would recognize and parses into a single enormous
    // expression, so it costs a per-file timeout and contributes no dependency.
    private fun isGenerated(file: File): Boolean = GENERATED_SUFFIXES.any { file.name.endsWith(it, ignoreCase = true) }

    private fun exceedsFileSizeLimit(file: File): Boolean {
        if (maxFileSizeKb <= NO_FILE_SIZE_LIMIT) return false
        val fileSizeKb = file.length() / BYTES_PER_KILOBYTE
        if (fileSizeKb < maxFileSizeKb) return false
        Logger.debug { "Skipping file (${fileSizeKb}KB >= ${maxFileSizeKb}KB limit): ${file.path}" }
        return true
    }

    private fun scanWithoutGitignore(directory: File, onFileFound: (() -> Unit)?): List<File> = directory
        .walkTopDown()
        .filter { it.isFile }
        .filter { file -> isAnalysable(file) }
        .onEach { onFileFound?.invoke() }
        .toList()

    private fun scanWithGitignore(rootDirectory: File, onFileFound: (() -> Unit)?): List<File> {
        val gitignoreHandler = GitignoreHandler(rootDirectory)

        return rootDirectory
            .walkTopDown()
            .onEnter { dir -> !gitignoreHandler.shouldExclude(dir) }
            .filter { it.isFile }
            .filter { file -> !gitignoreHandler.shouldExclude(file) }
            .filter { file -> isAnalysable(file) }
            .onEach { onFileFound?.invoke() }
            .toList()
    }

    fun readFileContent(file: File, charset: Charset = Charsets.UTF_8): Result<String> = runCatching {
        require(file.exists()) { "File does not exist: ${file.absolutePath}" }
        require(file.isFile) { "Path is not a file: ${file.absolutePath}" }
        file.readText(charset).withoutByteOrderMarks()
    }.onFailure { error ->
        Logger.error(error) { "Failed to read file: ${file.absolutePath}" }
    }

    // TreeSitter treats a byte order mark as source text and mis-tokenizes the identifiers around it.
    private fun String.withoutByteOrderMarks(): String = replace(BYTE_ORDER_MARK, "")

    companion object {
        const val NO_FILE_SIZE_LIMIT = 0

        private const val BYTE_ORDER_MARK = "﻿"
        private const val BYTES_PER_KILOBYTE = 1024
        private val GENERATED_SUFFIXES = listOf(".min.js", ".min.ts", ".bundle.js")
    }
}
