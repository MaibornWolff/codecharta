package de.maibornwolff.codecharta.parser.rawtextparser

import de.maibornwolff.codecharta.parser.rawtextparser.metrics.MetricsFactory
import de.maibornwolff.codecharta.parser.rawtextparser.model.FileMetrics
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.io.File
import java.nio.file.Paths
import java.util.concurrent.ConcurrentHashMap

class MetricCollector(private var root: File,
                      private val exclude: Array<String> = arrayOf(),
                      private val fileExtensions: Array<String> = arrayOf(),
                      private val parameters: Map<String, Int> = mapOf(),
                      private val metrics: List<String> = listOf()) {

    val MAX_FILE_NAME_PRINT_LENGTH = 30

    fun parse(): Map<String, FileMetrics> {
        val projectMetrics = ConcurrentHashMap<String, FileMetrics>()
        val excludePatterns = exclude.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

        runBlocking(Dispatchers.Default){
            root.walk().asSequence()
                    .filter{ it.isFile }
                    .forEach { launch{
                        val standardizedPath = "/" + getRelativeFileName(it.toString())
                        val isMatchingFileExtension = fileExtensions.isEmpty() || fileExtensions.contains(standardizedPath.substringAfterLast("."))
                        val isNotExcluded = !(exclude.isNotEmpty() && excludePatterns.containsMatchIn(standardizedPath))
                        if (it.isFile && isNotExcluded && isMatchingFileExtension) {
                            logProgress(it.name)
                            projectMetrics[standardizedPath] = parseFile(it)
                        }
                    }
                    }
        }
        return projectMetrics
    }

    private fun parseFile(file: File): FileMetrics {
        val metrics = MetricsFactory.create(metrics, parameters)
        file.readLines().stream().parallel().forEach { line -> metrics.forEach { it.parseLine(line) } }
        return metrics.map { it.getValue() }.reduceRight { current: FileMetrics, acc: FileMetrics ->
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

    private fun logProgress(fileName: String) {
        val currentFile = if (fileName.length > MAX_FILE_NAME_PRINT_LENGTH) {
            ".." + fileName.takeLast(MAX_FILE_NAME_PRINT_LENGTH)
        } else {
            fileName.padEnd(MAX_FILE_NAME_PRINT_LENGTH + 2)
        }
        System.err.print("\rParsing file: $currentFile")
    }
}