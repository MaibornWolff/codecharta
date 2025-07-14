package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.AvailableCollectors
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import de.maibornwolff.codecharta.util.Logger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.io.File
import java.nio.file.Paths
import java.util.concurrent.ConcurrentHashMap

class ProjectScanner(
    private val root: File,
    private val projectBuilder: ProjectBuilder,
    private val excludePatterns: List<String> = listOf(),
    private val includeExtensions: List<String> = listOf(),
) {
    private var totalFiles = 0L
    private var filesParsed = 0L
    private var ignoredFiles = 0L
    private val ignoredFileTypes = mutableSetOf<String>()

    private val parsingUnit = ParsingUnit.Files
    private val progressTracker = ProgressTracker()
    private val fileMetrics = ConcurrentHashMap<String, MutableNode>()
    private val excludePatternRegex = excludePatterns.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

    fun foundParsableFiles(): Boolean {
        return fileMetrics.isNotEmpty()
    }

    fun getIgnoredFiles(): Pair<Long, Set<String>> {
        return Pair(ignoredFiles, ignoredFileTypes)
    }

    fun getNotFoundFileExtensions(): Set<String> {
        val result = mutableSetOf<String>()
        for (extension in includeExtensions) {
            if (!fileMetrics.keys().toList().any { it.endsWith(extension) }) {
                result.add(extension)
            }
        }
        return result
    }

    fun traverseInputProject(verbose: Boolean) {
        runBlocking(Dispatchers.Default) {
            val parsableFiles = root.walk().filter {isParsableFile(it)}.toList()
            totalFiles = parsableFiles.size.toLong()

            parsableFiles.forEach { file ->
                launch {
                    filesParsed++
                    applyLanguageSpecificCollector(file, verbose)
                    if (!verbose) logProgress(file.name, filesParsed)
                }
            }
        }

        progressTracker.updateProgress(totalFiles, totalFiles, parsingUnit.name)
        if (verbose) Logger.info { "Analysis of files complete, creating output file..." }
        addAllNodesToProjectBuilder()
    }

    private fun applyLanguageSpecificCollector(file: File, verbose: Boolean) {
        val relativeFilePath = getRelativeFileName(file.toString())
        require(file.isFile) { "Expected file but found folder at $relativeFilePath!" }

        val collector = findCollectorForFileType(file.extension)?.collectorFactory

        require(collector != null) { "Unexpectedly encountered an unsupported file at $relativeFilePath!" }

        if (verbose) Logger.info { "Calculating metrics for file $relativeFilePath" }
        fileMetrics[relativeFilePath] = collector().collectMetricsForFile(file)
    }

    private fun getRelativeFileName(fileName: String): String {
        return root.toPath().toAbsolutePath()
            .relativize(Paths.get(fileName).toAbsolutePath())
            .toString()
            .replace('\\', '/')
    }

    private fun isParsableFile(file: File): Boolean {
        if (!file.isFile || isPathExcluded(file) || !isFileExtensionIncluded(file.extension)) return false

        return if (findCollectorForFileType(file.extension) != null) {
            true
        } else {
            ignoredFileTypes += file.extension
            ignoredFiles++
            false
        }
    }

    private fun isPathExcluded(file: File): Boolean {
        return this.excludePatterns.isNotEmpty() && excludePatternRegex.containsMatchIn(getRelativeFileName(file.toString()))
    }

    private fun isFileExtensionIncluded(fileExtension: String): Boolean {
        return includeExtensions.isEmpty() || includeExtensions.contains(fileExtension)
    }

    private fun findCollectorForFileType(fileExtension: String): AvailableCollectors? {
        return AvailableCollectors.entries.find { it.fileExtension.extension == ".$fileExtension" }
    }

    private fun logProgress(fileName: String, parsedFiles: Long) {
        progressTracker.updateProgress(totalFiles, parsedFiles, parsingUnit.name, fileName)
    }

    private fun addAllNodesToProjectBuilder() {
        val sortedFileMetrics = fileMetrics.entries.sortedBy { (relativePath, _) -> relativePath }
        for ((relativePath, node) in sortedFileMetrics) {
            val path = PathFactory.fromFileSystemPath(relativePath).parent
            projectBuilder.insertByPath(path, node)
        }
    }
}
