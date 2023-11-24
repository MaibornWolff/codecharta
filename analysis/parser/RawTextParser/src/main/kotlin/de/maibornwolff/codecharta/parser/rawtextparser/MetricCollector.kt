package de.maibornwolff.codecharta.parser.rawtextparser

import de.maibornwolff.codecharta.parser.rawtextparser.metrics.IndentationCounter
import de.maibornwolff.codecharta.parser.rawtextparser.metrics.Metric
import de.maibornwolff.codecharta.parser.rawtextparser.model.FileMetrics
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.io.File
import java.nio.file.Paths
import java.util.concurrent.ConcurrentHashMap

class MetricCollector(
    private var root: File,
    private val exclude: List<String> = listOf(),
    private val fileExtensions: List<String> = listOf(),
    //private val parameters: Map<String, Int> = mapOf(),
    private val metrics: List<String> = listOf(),
    //do these have to get a standard value here? -> dont think so, root also didnt get one
    //TODO remove standard values
    private val verbose: Boolean = false,
    private val maxIndentLvl: Int = RawTextParser.DEFAULT_INDENT_LVL,
    private val tabWidth: Int? = 0
) {

    private var excludePatterns: Regex = exclude.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

    private var filesParsed = 0L
    private var totalFiles = 0L
    private val progressTracker: ProgressTracker = ProgressTracker()
    private val parsingUnit = ParsingUnit.Files

    fun parse(): Map<String, FileMetrics> {
        val projectMetrics = ConcurrentHashMap<String, FileMetrics>()
        var lastFileName = ""

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
                        projectMetrics[standardizedPath] = parseFile(it)
                        lastFileName = it.name
                    }
                }
            }
        }
        logProgress(lastFileName, totalFiles)

        return projectMetrics
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
        //TODO remove next line later
        val newTabWidth = tabWidth ?: 0
        //maybe directly call the IndentationCounter with the correct values here?
        //val metricsList = MetricsFactory.create(metrics, verbose, maxIndentLvl, tabWidth)
        val metricsList = mutableListOf<Metric>()
        if (metrics.isEmpty() || metrics.any {it.equals(RawTextParser.METRIC_INDENT_LVL, ignoreCase = true)}) {
            metricsList.add(IndentationCounter(maxIndentLvl, verbose, newTabWidth))
        }

        file
            .bufferedReader()
            .useLines { lines -> lines.forEach { line -> metricsList.forEach { it.parseLine(line) } } }

        return metricsList.map { it.getValue() }.reduceRight { current: FileMetrics, acc: FileMetrics ->
            acc.metricMap.putAll(current.metricMap)
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
