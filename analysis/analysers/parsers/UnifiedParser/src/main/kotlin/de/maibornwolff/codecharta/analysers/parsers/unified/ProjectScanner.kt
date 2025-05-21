package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors.TypescriptCollector
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
    val root: File,
    val projectBuilder: ProjectBuilder,
    val excludePatterns: List<String> = listOf(),
    val includeExtensions: List<String> = listOf(),
    val metricsToCompute: List<String> = listOf()
) {
    private var totalFiles = 0L
    private var filesParsed = 0L
    private val parsingUnit = ParsingUnit.Files
    private val progressTracker = ProgressTracker()

    fun traverseInputProject(verbose: Boolean) {
        val excludePatterns = excludePatterns.joinToString(separator = "|", prefix = "(", postfix = ")").toRegex()
        var lastFileName = ""

        runBlocking(Dispatchers.Default) {
            val files = root.walk().filter { it.isFile }
            lastFileName = files.last().toString()
            totalFiles = files.count().toLong()

            files.forEach { file ->
                launch {
                    filesParsed++
                    val relativeFilePath = getRelativeFileName(file.toString())
                    require(file.isFile) { "Expected file but found folder at $relativeFilePath!" }
                    if (!isPathExcluded(excludePatterns, relativeFilePath) && isParsableFileExtension(relativeFilePath)) {
                        applyCorrectCollector(file, projectBuilder, metricsToCompute)
                        logProgress(file.name, filesParsed)
                        lastFileName = file.name
                        if (verbose) Logger.info { "Parsing file $relativeFilePath" }
                    } else if (verbose) {
                        Logger.warn { "Ignoring file $relativeFilePath" }
                    }
                }
            }
        }

        logProgress(lastFileName, totalFiles)
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

    private fun applyCorrectCollector(file: File, projectBuilder: ProjectBuilder, metricsToCompute: List<String>) {
        val tsCollector = TypescriptCollector()

        when (file.extension) {
            "ts" -> tsCollector.collectMetricsForFile(file, projectBuilder, metricsToCompute)
            // TODO: maybe add something which file types were skipped
        }
    }

    private fun logProgress(fileName: String, parsedFiles: Long) {
        progressTracker.updateProgress(totalFiles, parsedFiles, parsingUnit.name, fileName)
    }
}
