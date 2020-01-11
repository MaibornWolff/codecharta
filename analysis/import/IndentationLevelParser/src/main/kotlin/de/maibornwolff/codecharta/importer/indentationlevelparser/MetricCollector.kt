package de.maibornwolff.codecharta.importer.indentationlevelparser

import de.maibornwolff.codecharta.importer.indentationlevelparser.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.indentationlevelparser.model.FileMetrics
import java.io.File
import java.nio.file.Paths

class MetricCollector(private var root: File,
                      private val exclude: Array<String> = arrayOf(),
                      private val parameters: Map<String, Int> = mapOf(),
                      private val metrics: List<String> = listOf()) {

    fun parse(): Map<String, FileMetrics> {
        val projectMetrics = mutableMapOf<String, FileMetrics>()
        val excludePatterns = exclude.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()

        root.walk().forEach {
            if (it.isFile) {
                val standardizedPath = "/" + getRelativeFileName(it.toString())
                if (it.isFile && !(exclude.isNotEmpty() && excludePatterns.containsMatchIn(standardizedPath))) {
                    projectMetrics[standardizedPath] = parseFile(it)
                }
            }
        }
        return projectMetrics
    }

    private fun parseFile(file: File): FileMetrics {
        val metrics = MetricsFactory.create(metrics, parameters)
        file.readLines().forEach { line -> metrics.forEach { it.parseLine(line) } }
        return metrics.map { it.getValue() }.reduceRight { current, acc ->
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
}