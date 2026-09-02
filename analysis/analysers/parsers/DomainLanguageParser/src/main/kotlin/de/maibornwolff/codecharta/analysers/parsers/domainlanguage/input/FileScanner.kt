package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignoreHandler
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.nio.charset.Charset

class FileScanner(private val allowedExtensions: List<String>) {
    private val fileFilter = FileFilter(allowedExtensions)
    private val testFileDetector = TestFileDetector()

    fun scan(
        inputPath: String,
        bypassGitignore: Boolean = false,
        excludeTests: Boolean = false,
        onFileFound: (() -> Unit)? = null
    ): List<File> {
        val input = File(inputPath)
        if (!input.exists()) {
            Logger.warn { "Input does not exist: $inputPath" }
            return emptyList()
        }
        if (input.isFile) {
            return scanSingleFile(input, excludeTests, onFileFound)
        }

        return if (bypassGitignore) {
            scanWithoutGitignore(input, excludeTests, onFileFound)
        } else {
            scanWithGitignore(input, excludeTests, onFileFound)
        }
    }

    private fun scanSingleFile(file: File, excludeTests: Boolean, onFileFound: (() -> Unit)?): List<File> {
        if (!isAnalysable(file, excludeTests)) return emptyList()
        onFileFound?.invoke()
        return listOf(file)
    }

    private fun isAnalysable(file: File, excludeTests: Boolean): Boolean = fileFilter.matchesExtension(file) &&
        (!excludeTests || !testFileDetector.isTestFile(file))

    private fun scanWithoutGitignore(directory: File, excludeTests: Boolean, onFileFound: (() -> Unit)?): List<File> = directory
        .walkTopDown()
        .filter { it.isFile }
        .filter { file -> isAnalysable(file, excludeTests) }
        .onEach { onFileFound?.invoke() }
        .toList()

    private fun scanWithGitignore(rootDirectory: File, excludeTests: Boolean, onFileFound: (() -> Unit)?): List<File> {
        val gitignoreHandler = GitignoreHandler(rootDirectory)

        return rootDirectory
            .walkTopDown()
            .onEnter { dir -> !gitignoreHandler.shouldExclude(dir) }
            .filter { it.isFile }
            .filter { file -> !gitignoreHandler.shouldExclude(file) }
            .filter { file -> isAnalysable(file, excludeTests) }
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

    // TreeSitter treats a byte order mark as source text and mis-tokenizes the identifiers around it,
    // which extracts "class" as the two words "cla" and "ss".
    private fun String.withoutByteOrderMarks(): String = replace(BYTE_ORDER_MARK, "")

    companion object {
        private const val BYTE_ORDER_MARK = "\uFEFF"
    }
}
