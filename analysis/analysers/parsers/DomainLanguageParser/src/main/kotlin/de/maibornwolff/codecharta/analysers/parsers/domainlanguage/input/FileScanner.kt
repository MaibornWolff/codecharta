package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignoreHandler
import io.github.oshai.kotlinlogging.KotlinLogging
import java.io.File
import java.nio.charset.Charset

private val logger = KotlinLogging.logger {}

class FileScanner(private val allowedExtensions: List<String>) {
    private val fileFilter = FileFilter(allowedExtensions)
    private val testFileDetector = TestFileDetector()

    fun scan(
        directoryPath: String,
        bypassGitignore: Boolean = false,
        excludeTests: Boolean = false,
        onFileFound: (() -> Unit)? = null
    ): List<File> {
        val directory = File(directoryPath)
        if (!directory.exists() || !directory.isDirectory) {
            logger.warn { "Directory does not exist or is not a directory: $directoryPath" }
            return emptyList()
        }

        return if (bypassGitignore) {
            scanWithoutGitignore(directory, excludeTests, onFileFound)
        } else {
            scanWithGitignore(directory, excludeTests, onFileFound)
        }
    }

    private fun scanWithoutGitignore(directory: File, excludeTests: Boolean, onFileFound: (() -> Unit)?): List<File> = directory
        .walkTopDown()
        .filter { it.isFile }
        .filter { file -> fileFilter.matchesExtension(file) }
        .filter { file -> !excludeTests || !testFileDetector.isTestFile(file) }
        .onEach { onFileFound?.invoke() }
        .toList()

    private fun scanWithGitignore(rootDirectory: File, excludeTests: Boolean, onFileFound: (() -> Unit)?): List<File> {
        val gitignoreHandler = GitignoreHandler(rootDirectory)

        return rootDirectory
            .walkTopDown()
            .onEnter { dir -> !gitignoreHandler.shouldExclude(dir) }
            .filter { it.isFile }
            .filter { file -> !gitignoreHandler.shouldExclude(file) }
            .filter { file -> fileFilter.matchesExtension(file) }
            .filter { file -> !excludeTests || !testFileDetector.isTestFile(file) }
            .onEach { onFileFound?.invoke() }
            .toList()
    }

    fun readFileContent(file: File, charset: Charset = Charsets.UTF_8): Result<String> = runCatching {
        require(file.exists()) { "File does not exist: ${file.absolutePath}" }
        require(file.isFile) { "Path is not a file: ${file.absolutePath}" }
        file.readText(charset)
    }.onFailure { error ->
        logger.error(error) { "Failed to read file: ${file.absolutePath}" }
    }
}
