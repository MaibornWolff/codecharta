package de.maibornwolff.codecharta.analysers.parsers.rawtext

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignoreHandler
import de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics.IndentationMetric
import de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics.LinesOfCodeMetric
import de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics.Metric
import de.maibornwolff.codecharta.model.ChecksumCalculator
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import de.maibornwolff.codecharta.util.Logger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.io.File
import java.util.concurrent.atomic.AtomicLong

class ProjectMetricsCollector(
    private var root: File,
    private val exclude: List<String>,
    private val fileExtensions: List<String>,
    private val metricNames: List<String>,
    private val verbose: Boolean,
    private val maxIndentLvl: Int,
    private val tabWidth: Int,
    private val baseFileNodeMap: Map<String, Node> = emptyMap(),
    useGitignore: Boolean = true
) {
    private var totalFiles = 0L
    private var filesParsed = 0L
    private val filesSkipped = AtomicLong(0)
    private val filesAnalyzed = AtomicLong(0)
    private val parsingUnit = ParsingUnit.Files
    private val progressTracker = ProgressTracker()
    private var excludePatterns = createExcludePatterns()

    private val gitignoreHandler = if (useGitignore) GitignoreHandler(root) else null

    fun parseProject(): ProjectMetrics {
        var lastFileName = ""
        val projectMetrics = ProjectMetrics()

        runBlocking(Dispatchers.Default) {
            val files = root.walkTopDown()
                .onEnter { dir -> !isExcludedByGitignore(dir) }
                .filter { it.isFile && !isExcludedByGitignore(it) }

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
                        projectMetrics.addFileMetrics(standardizedPath, collectMetricsForFile(it, standardizedPath))
                        lastFileName = it.name
                    }
                }
            }
        }

        logProgress(lastFileName, totalFiles)
        logStatistics()

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

    private fun isExcludedByGitignore(file: File): Boolean {
        return gitignoreHandler?.shouldExclude(file) == true
    }

    fun getGitIgnoreStatistics(): Pair<Int, List<String>> {
        return gitignoreHandler?.getStatistics() ?: Pair(0, emptyList())
    }

    private fun collectMetricsForFile(file: File, standardizedPath: String): FileMetrics {
        val fileContent = file.readText()
        val currentChecksum = ChecksumCalculator.calculateChecksum(fileContent)
        val baseNode = baseFileNodeMap[standardizedPath.removePrefix("/")]
        return if (baseNode != null && baseNode.checksum == currentChecksum) {
            reuseMetricsFromBaseFile(baseNode)
        } else {
            calculateMetricsForFile(file, currentChecksum)
        }
    }

    private fun reuseMetricsFromBaseFile(baseNode: Node): FileMetrics {
        filesSkipped.incrementAndGet()

        val fileMetrics = FileMetrics()
        baseNode.attributes.forEach { (key, value) ->
            fileMetrics.addMetric(key, value.toString().toDoubleOrNull() ?: 0.0)
        }
        fileMetrics.checksum = baseNode.checksum
        return fileMetrics
    }

    private fun calculateMetricsForFile(file: File, checksum: String?): FileMetrics {
        filesAnalyzed.incrementAndGet()

        val metrics = createMetricsFromMetricNames()
        file.bufferedReader().useLines { lines -> lines.forEach { line -> metrics.forEach { it.parseLine(line) } } }

        if (metrics.isEmpty()) return FileMetrics()
        val resultMetrics = metrics.map { it.getValue() }.reduceRight { current: FileMetrics, acc: FileMetrics ->
            acc.metricsMap.putAll(current.metricsMap)
            acc
        }
        resultMetrics.checksum = checksum
        return resultMetrics
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

    private fun logStatistics() {
        if (baseFileNodeMap.isNotEmpty()) {
            val skipped = filesSkipped.get()
            val analyzed = filesAnalyzed.get()
            val total = skipped + analyzed
            Logger.info {
                "Checksum comparison: $skipped files skipped, $analyzed files analyzed " +
                    "(${skipped * 100 / total.coerceAtLeast(1)}% reused)"
            }
        }
    }
}
