package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.KotlinCollector
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.MetricCollector
import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.TypescriptCollector
import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.AvailableMetrics
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

    fun traverseInputProject(verbose: Boolean) {
        val excludePatterns = excludePatterns.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()
        var lastParsedFile = ""

        runBlocking(Dispatchers.Default) {
            val files = root.walk().filter { it.isFile }
            lastParsedFile = files.last().toString()
            totalFiles = files.count().toLong()

            files.forEach { file ->
                launch {
                    filesParsed++
                    lastParsedFile = parseFile(file, excludePatterns, verbose)
                }
            }
        }

        logProgress(lastParsedFile, totalFiles)

        if (includeExtensions.isNotEmpty()) {
            Logger.info { "Files with extensions '${ignoredFileTypes}' were ignored as they are not yet supported." }
        }
    }

    fun getIgnoredFileTypes(): Set<String> {
        return ignoredFileTypes
    }

    private fun parseFile(
        file: File,
        excludePatterns: Regex,
        verbose: Boolean
    ): String {
        var lastParsedFile = ""
        val relativeFilePath = getRelativeFileName(file.toString())
        require(file.isFile) { "Expected file but found folder at $relativeFilePath!" }

        if (!isPathExcluded(excludePatterns, relativeFilePath) && isParsableFileExtension(relativeFilePath)) {
            logProgress(file.name, filesParsed)
            lastParsedFile = file.name
            if (verbose) Logger.info { "Calculating metrics for file $relativeFilePath" }

            applyLanguageSpecificCollector(file, relativeFilePath, projectBuilder, metricsToCompute)
        } else if (verbose) {
            Logger.warn { "Ignoring file $relativeFilePath" }
        }
        return lastParsedFile
    }

    private fun isPathExcluded(excludePatterns: Regex, relativeFilePath: String): Boolean {
        return this.excludePatterns.isNotEmpty() && excludePatterns.containsMatchIn(relativeFilePath)
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

    private fun applyLanguageSpecificCollector(file: File, relativePath: String, projectBuilder: ProjectBuilder, metricsToCompute: List<AvailableMetrics>) {
        val fileExtension = file.extension
        val collector: MetricCollector
        when (fileExtension) {
            "ts" -> collector = TypescriptCollector()
            "kt" -> collector = KotlinCollector()
            else -> {
                ignoredFileTypes += file.extension
                return
            }
        }
        val fileNode = collector.collectMetricsForFile(file, metricsToCompute)

        val path = PathFactory.fromFileSystemPath(relativePath).parent
        projectBuilder.insertByPath(path, fileNode)
    }

    private fun logProgress(fileName: String, parsedFiles: Long) {
        progressTracker.updateProgress(totalFiles, parsedFiles, parsingUnit.name, fileName)
    }
}
