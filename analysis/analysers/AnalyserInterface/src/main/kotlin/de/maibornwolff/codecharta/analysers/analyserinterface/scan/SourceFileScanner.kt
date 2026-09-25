package de.maibornwolff.codecharta.analysers.analyserinterface.scan

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignoreHandler
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.nio.charset.Charset

/**
 * Lists the source files an analyser should read: a directory walk that honours `.gitignore`, the
 * `-e` exclude patterns, the allowed extensions, an optional size limit and an optional test-file
 * exclusion, returned in path order so nothing downstream depends on how the file system lists a
 * directory. A single file is a legal input and is judged by extension, size and test status alone.
 */
class SourceFileScanner(
    private val allowedExtensions: Collection<String>,
    excludePatterns: List<String> = emptyList(),
    private val maxFileSizeKb: Int = NO_FILE_SIZE_LIMIT,
    private val excludeTests: Boolean = false
) {
    // One alternation over every pattern, matched against the path inside the project the way
    // UnifiedParser's ProjectScanner does, so `-e` behaves the same for every parser.
    private val excludePatternRegex: Regex? =
        excludePatterns.takeIf { it.isNotEmpty() }?.joinToString(separator = "|", prefix = "(", postfix = ")")?.toRegex()

    fun scan(input: File, useGitignore: Boolean = true, onFileFound: (() -> Unit)? = null): List<File> {
        if (!input.exists()) {
            Logger.warn { "Input does not exist: ${input.path}" }
            return emptyList()
        }
        // A single file's own directory is the project it is judged against, so a lone `FooTest.java`
        // is still recognized as a test.
        val testFileDetector = TestFileDetector(if (input.isFile) input.absoluteFile.parentFile else input)
        val files =
            if (input.isFile) {
                listOf(input).filter { isAnalysable(it, testFileDetector) }
            } else {
                walk(input, if (useGitignore) GitignoreHandler(input) else null, testFileDetector)
            }
        return files.sortedBy { it.path }.onEach { onFileFound?.invoke() }
    }

    private fun walk(rootDirectory: File, gitignoreHandler: GitignoreHandler?, testFileDetector: TestFileDetector): List<File> =
        rootDirectory
            .walkTopDown()
            .onEnter { directory -> !isExcluded(directory, rootDirectory, gitignoreHandler) }
            .filter { it.isFile }
            .filter { file -> !isExcluded(file, rootDirectory, gitignoreHandler) && isAnalysable(file, testFileDetector) }
            .toList()

    private fun isExcluded(candidate: File, rootDirectory: File, gitignoreHandler: GitignoreHandler?): Boolean =
        gitignoreHandler?.shouldExclude(candidate) == true || isExcludedByPattern(candidate, rootDirectory)

    // Directories are matched with a trailing slash so a folder pattern such as `/node_modules/` prunes
    // the walk at the folder instead of testing every file below it.
    private fun isExcludedByPattern(candidate: File, rootDirectory: File): Boolean {
        val regex = excludePatternRegex ?: return false
        if (candidate == rootDirectory) return false
        val relativePath = candidate.toRelativeString(rootDirectory).replace(File.separatorChar, '/')
        val pathInsideProject = if (candidate.isDirectory) "/$relativePath/" else "/$relativePath"
        return regex.containsMatchIn(pathInsideProject)
    }

    private fun isAnalysable(file: File, testFileDetector: TestFileDetector): Boolean {
        if (!matchesAnyExtension(file.name, allowedExtensions) || isGenerated(file) || exceedsFileSizeLimit(file)) return false
        return !excludeTests || !testFileDetector.isTestFile(file)
    }

    // A minified bundle declares nothing a reader would recognize and parses into a single enormous
    // expression, so it costs a per-file timeout and contributes nothing.
    private fun isGenerated(file: File): Boolean = GENERATED_SUFFIXES.any { file.name.endsWith(it, ignoreCase = true) }

    private fun exceedsFileSizeLimit(file: File): Boolean {
        if (maxFileSizeKb <= NO_FILE_SIZE_LIMIT) return false
        val fileSizeKb = file.length() / BYTES_PER_KILOBYTE
        if (fileSizeKb < maxFileSizeKb) return false
        Logger.debug { "Skipping file (${fileSizeKb}KB >= ${maxFileSizeKb}KB limit): ${file.path}" }
        return true
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

        private const val BYTE_ORDER_MARK = "\uFEFF"
        private const val BYTES_PER_KILOBYTE = 1024
        private val GENERATED_SUFFIXES = listOf(".min.js", ".min.ts", ".bundle.js")
    }
}
