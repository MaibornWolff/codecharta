package de.maibornwolff.codecharta.analysers.parsers.dependency.input

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignoreHandler
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.nio.charset.Charset

class FileScanner(
    private val allowedExtensions: List<String>,
    private val maxFileSizeKb: Int = NO_FILE_SIZE_LIMIT,
    private val excludeTests: Boolean = true,
    excludePatterns: List<String> = emptyList()
) {
    private val fileFilter = FileFilter(allowedExtensions)

    // One alternation over every pattern, matched against the path inside the project the way
    // UnifiedParser's ProjectScanner does, so `-e` behaves the same for every parser.
    private val excludePatternRegex: Regex? =
        excludePatterns.takeIf { it.isNotEmpty() }?.joinToString(separator = "|", prefix = "(", postfix = ")")?.toRegex()

    /**
     * The analysable files under [inputPath], or [inputPath] itself when it is a file, in path order so
     * that everything downstream — edge order, cycle breaking — is independent of how the file system
     * happens to list a directory.
     */
    fun scan(inputPath: String, bypassGitignore: Boolean = false, onFileFound: (() -> Unit)? = null): List<File> {
        val input = File(inputPath)
        if (!input.exists()) {
            Logger.warn { "Input does not exist: $inputPath" }
            return emptyList()
        }
        // A single file's own directory is the project it is judged against, so a lone `FooTest.java`
        // is still recognized as a test.
        val testFileDetector = TestFileDetector(if (input.isFile) input.absoluteFile.parentFile else input)
        if (input.isFile) {
            return scanSingleFile(input, testFileDetector, onFileFound)
        }

        val files =
            if (bypassGitignore) {
                scanWithoutGitignore(input, testFileDetector)
            } else {
                scanWithGitignore(input, testFileDetector)
            }
        return files.sortedBy { it.path }.onEach { onFileFound?.invoke() }
    }

    private fun scanSingleFile(file: File, testFileDetector: TestFileDetector, onFileFound: (() -> Unit)?): List<File> {
        if (!isAnalysable(file, testFileDetector)) return emptyList()
        onFileFound?.invoke()
        return listOf(file)
    }

    private fun isAnalysable(file: File, testFileDetector: TestFileDetector): Boolean = fileFilter.matchesExtension(file) &&
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

    private fun scanWithoutGitignore(rootDirectory: File, testFileDetector: TestFileDetector): List<File> = rootDirectory
        .walkTopDown()
        .onEnter { directory -> !isExcludedByPattern(directory, rootDirectory) }
        .filter { it.isFile }
        .filter { file -> !isExcludedByPattern(file, rootDirectory) && isAnalysable(file, testFileDetector) }
        .toList()

    private fun scanWithGitignore(rootDirectory: File, testFileDetector: TestFileDetector): List<File> {
        val gitignoreHandler = GitignoreHandler(rootDirectory)

        return rootDirectory
            .walkTopDown()
            .onEnter { directory -> !gitignoreHandler.shouldExclude(directory) && !isExcludedByPattern(directory, rootDirectory) }
            .filter { it.isFile }
            .filter { file -> !gitignoreHandler.shouldExclude(file) && !isExcludedByPattern(file, rootDirectory) }
            .filter { file -> isAnalysable(file, testFileDetector) }
            .toList()
    }

    // Directories are matched with a trailing slash so a folder pattern such as `/node_modules/` prunes
    // the walk at the folder instead of testing every file below it.
    private fun isExcludedByPattern(candidate: File, rootDirectory: File): Boolean {
        val regex = excludePatternRegex ?: return false
        if (candidate == rootDirectory) return false
        val relativePath = candidate.toRelativeString(rootDirectory).replace(File.separatorChar, '/')
        val pathInsideProject = if (candidate.isDirectory) "/$relativePath/" else "/$relativePath"
        return regex.containsMatchIn(pathInsideProject)
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
