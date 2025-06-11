package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.KotlinCollector
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.MetricCollector
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.TypescriptCollector
import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.AvailableMetrics
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
    private val metricsToCompute: List<AvailableMetrics> = listOf()
) {
    private var totalFiles = 0L
    private var filesParsed = 0L
    private val parsingUnit = ParsingUnit.Files
    private val progressTracker = ProgressTracker()
    private val ignoredFileTypes = mutableSetOf<String>()
    private val fileMetrics = ConcurrentHashMap<String, MutableNode>()

    fun foundParsableFiles(): Boolean {
        return fileMetrics.isNotEmpty()
    }

    fun getIgnoredFileTypes(): Set<String> {
        return ignoredFileTypes
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
        val excludePatternRegex = excludePatterns.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()
        var lastParsedFile: String

        runBlocking(Dispatchers.Default) {
            val files = root.walk().filter { it.isFile }
            lastParsedFile = files.last().toString()
            totalFiles = files.count().toLong()

            files.forEach { file ->
                launch {
                    filesParsed++
                    lastParsedFile = parseFile(file, excludePatternRegex, verbose)
                }
            }
        }

        if (!verbose) logProgress(lastParsedFile, totalFiles)
        addAllNodesToProjectBuilder()
    }

    private fun parseFile(file: File, excludePatternRegex: Regex, verbose: Boolean): String {
        var lastParsedFile = ""
        val relativeFilePath = getRelativeFileName(file.toString())
        require(file.isFile) { "Expected file but found folder at $relativeFilePath!" }

        if (!isPathExcluded(excludePatternRegex, relativeFilePath) && isParsableFileExtension(relativeFilePath)) {
            if (!verbose) logProgress(file.name, filesParsed)

            applyLanguageSpecificCollector(file, relativeFilePath, verbose)
            lastParsedFile = file.name
        } else if (verbose) {
            Logger.warn { "Ignoring file $relativeFilePath" }
        }
        return lastParsedFile
    }

    private fun isPathExcluded(excludePatternRegex: Regex, relativeFilePath: String): Boolean {
        return this.excludePatterns.isNotEmpty() && excludePatternRegex.containsMatchIn(relativeFilePath)
    }

    private fun isParsableFileExtension(path: String): Boolean {
        return includeExtensions.isEmpty() || includeExtensions.contains(path.substringAfterLast("."))
    }

    private fun getRelativeFileName(fileName: String): String {
        return root.toPath().toAbsolutePath()
            .relativize(Paths.get(fileName).toAbsolutePath())
            .toString()
            .replace('\\', '/')
    }

    private fun applyLanguageSpecificCollector(file: File, relativePath: String, verbose: Boolean) {
        val fileExtension = file.extension
        val collector: MetricCollector
        when (fileExtension) {
            "ts" -> collector = TypescriptCollector()
            "kt" -> collector = KotlinCollector()
            else -> {
                ignoredFileTypes += file.extension
                if (verbose) Logger.warn { "Ignoring file $relativePath" }
                return
            }
        }
        if (verbose) Logger.info { "Calculating metrics for file $relativePath" }
        fileMetrics[relativePath] = collector.collectMetricsForFile(file, metricsToCompute)
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
