package de.maibornwolff.codecharta.analysers.parsers.rawtext

import de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics.IndentationMetric
import de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics.LinesOfCodeMetric
import de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics.Metric
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.io.File

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
    private val progressTracker = ProgressTracker()
    private var excludePatterns = createExcludePatterns()

    fun parseProject(): ProjectMetrics {
        var lastFileName = ""
        val projectMetrics = ProjectMetrics()

        runBlocking(Dispatchers.Default) {
            val files =
                root.walk().asSequence()
                    .filter { it.isFile }

            totalFiles = files.count().toLong()

            files.forEach {
                launch {
                    val standardizedPath = getStandardizedPath(it)

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

    private fun createExcludePatterns(): Regex {
        return exclude.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()
    }

    private fun createMetricsFromMetricNames(): List<Metric> {
        if (metricNames.isEmpty()) {
            return getAllMetrics()
        }

        val metrics = mutableListOf<Metric>()
        if (IndentationMetric.NAME in metricNames) {
            metrics.add(IndentationMetric(maxIndentLvl, verbose, tabWidth))
        }
        if (LinesOfCodeMetric.NAME in metricNames) {
            metrics.add(LinesOfCodeMetric())
        }

        return metrics
    }

    private fun getAllMetrics(): List<Metric> {
        val metrics = mutableListOf<Metric>()
        metrics.add(IndentationMetric(maxIndentLvl, verbose, tabWidth))
        metrics.add(LinesOfCodeMetric())
        return metrics.toList()
    }

    private fun isParsableFileExtension(path: String): Boolean {
        return fileExtensions.isEmpty() ||
            fileExtensions.contains(path.substringAfterLast("."))
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

    private fun getStandardizedPath(file: File): String {
        val normalizedRoot = if (root.isFile) root.parentFile else root
        val relativePath =
            normalizedRoot.toPath().toAbsolutePath()
                .relativize(file.toPath().toAbsolutePath())
                .toString()
                .replace(File.separatorChar, '/')
                .removePrefix("/")

        return "/$relativePath"
    }

    private fun logProgress(fileName: String, parsedFiles: Long) {
        progressTracker.updateProgress(totalFiles, parsedFiles, parsingUnit.name, fileName)
    }
}
