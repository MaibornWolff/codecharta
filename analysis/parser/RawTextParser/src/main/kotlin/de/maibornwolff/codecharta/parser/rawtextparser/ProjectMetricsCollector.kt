package de.maibornwolff.codecharta.parser.rawtextparser

import de.maibornwolff.codecharta.parser.rawtextparser.metrics.IndentationMetric
import de.maibornwolff.codecharta.parser.rawtextparser.metrics.Metric
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import mu.KotlinLogging
import java.io.File
import java.nio.file.Paths

class ProjectMetricsCollector(
    private var root: File,
    private val exclude: List<String>,
    private val fileExtensions: List<String>,
    private val metricNames: List<String>,
    private val verbose: Boolean,
    private val maxIndentLvl: Int,
    private val tabWidth: Int
                             ) {

    private var totalFiles = 0L
    private var filesParsed = 0L
    private val parsingUnit = ParsingUnit.Files
    private val progressTracker: ProgressTracker = ProgressTracker()
    private var excludePatterns: Regex = exclude.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

    private val logger = KotlinLogging.logger {}

    fun parseProject(): ProjectMetrics {
        var lastFileName = ""
        val projectMetrics = ProjectMetrics()

        runBlocking(Dispatchers.Default) {
            val files = root.walk().asSequence()
                .filter { it.isFile }

            totalFiles = files.count().toLong()

            files.forEach {
                launch {
                    val standardizedPath = "/" + getRelativeFileName(it.toString())

                    if (
                        !isPathExcluded(standardizedPath) &&
                        isParsableFileExtension(standardizedPath)
                    ) {
                        filesParsed++
                        logProgress(it.name, filesParsed)
                        projectMetrics.addFileMetrics(standardizedPath, parseFile(it))
                        lastFileName = it.name
                    }
                }
            }
        }

        logProgress(lastFileName, totalFiles)

        return projectMetrics
    }

    private fun createMetricsFromMetricNames(): MutableList<Metric> {
        val metrics = mutableListOf<Metric>()
        if (metricNames.isEmpty() || metricNames.any { it.equals(IndentationMetric.NAME, ignoreCase = true) }) {
            metrics.add(IndentationMetric(maxIndentLvl, verbose, tabWidth))
        }
        return metrics
    }

    private fun isParsableFileExtension(path: String): Boolean {
        return fileExtensions.isEmpty() ||
               fileExtensions.contains(path.substringAfterLast(".")) ||
               fileExtensions.contains(".${path.substringAfterLast(".")}")
    }

    private fun isPathExcluded(path: String): Boolean {
        return exclude.isNotEmpty() && excludePatterns.containsMatchIn(path)
    }

    private fun parseFile(file: File): FileMetrics {
        val metrics = createMetricsFromMetricNames()
        file
            .bufferedReader()
            .useLines { lines -> lines.forEach { line -> metrics.forEach { it.parseLine(line) } } }

        if (metrics.isEmpty()) return FileMetrics()
        return metrics.map { it.getValue() }.reduceRight { current: FileMetrics, acc: FileMetrics ->
            acc.metricsMap.putAll(current.metricsMap)
            acc
        }
    }

    private fun getRelativeFileName(fileName: String): String {
        if (root.isFile) root = root.parentFile

        return root.toPath().toAbsolutePath()
            .relativize(Paths.get(fileName).toAbsolutePath())
            .toString()
            .replace('\\', '/')
    }

    private fun logProgress(fileName: String, parsedFiles: Long) {
        progressTracker.updateProgress(totalFiles, parsedFiles, parsingUnit.name, fileName)
    }
}
