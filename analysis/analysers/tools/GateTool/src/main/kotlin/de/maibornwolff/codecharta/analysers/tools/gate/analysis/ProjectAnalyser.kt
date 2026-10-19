package de.maibornwolff.codecharta.analysers.tools.gate.analysis

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.failures.FailableRun
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeResolverStrategy
import de.maibornwolff.codecharta.analysers.filters.mergefilter.ProjectMerger
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateException
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.OutputFileHandler
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.FileExtension
import picocli.CommandLine
import java.io.File
import java.io.PrintWriter
import java.io.StringWriter
import java.util.concurrent.Callable
import java.util.concurrent.ExecutionException
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.concurrent.TimeUnit
import kotlin.io.path.createTempDirectory

class AnalysisException(message: String) : GateException(message)

data class ConfiguredAnalyser(val analyser: AnalyserInterface, val arguments: List<String> = emptyList())

class ProjectAnalyser {
    fun analyse(projectFolder: File, analysers: List<ConfiguredAnalyser>, outputFolder: File, parallel: Boolean = false): Project {
        if (analysers.isEmpty()) throw AnalysisException("No analyser is switched on that applies to ${projectFolder.path}.")

        val workFolder = createTempDirectory(WORK_FOLDER_PREFIX).toFile()
        try {
            val excludePattern = excludePatternFor(projectFolder, outputFolder)
            val runOne = { analyser: ConfiguredAnalyser -> runAnalyser(analyser, projectFolder, workFolder, excludePattern) }
            val projects = if (parallel) runInParallel(analysers, runOne) else analysers.map(runOne)
            return ProjectMerger(projects, MergeResolverStrategy.recursive()).merge()
        } finally {
            workFolder.deleteRecursively()
        }
    }

    private fun runInParallel(analysers: List<ConfiguredAnalyser>, runOne: (ConfiguredAnalyser) -> Project): List<Project> {
        val threadPool = Executors.newFixedThreadPool(minOf(analysers.size, Runtime.getRuntime().availableProcessors()))
        try {
            return analysers
                .map { analyser -> threadPool.submit(Callable { runOne(analyser) }) }
                .map { future -> resultOf(future) }
        } finally {
            threadPool.shutdown()
            threadPool.awaitTermination(Long.MAX_VALUE, TimeUnit.DAYS)
        }
    }

    private fun resultOf(future: Future<Project>): Project = try {
        future.get()
    } catch (exception: ExecutionException) {
        throw exception.cause ?: exception
    }

    private fun runAnalyser(configured: ConfiguredAnalyser, projectFolder: File, workFolder: File, excludePattern: String?): Project {
        val analyser = configured.analyser
        val mapFile = File(workFolder, analyser.name + FileExtension.CCJSON.primaryExtension)
        val arguments =
            listOf(projectFolder.path, "--output-file", mapFile.path) + configured.arguments +
                listOfNotNull(excludePattern?.let { "--exclude=$it" })
        val failureReason = execute(analyser, arguments)
        val writtenFile = File(OutputFileHandler.checkAndFixFileExtension(mapFile.path, true, FileExtension.JSON))
        if (failureReason != null || !writtenFile.exists()) {
            throw AnalysisException("The analyser ${analyser.name} failed on ${projectFolder.path}: ${failureReason ?: "it wrote no map"}")
        }
        return writtenFile.inputStream().use { ProjectDeserializer.deserializeProject(it) }
    }

    private fun execute(analyser: AnalyserInterface, arguments: List<String>): String? {
        var failureReason: String? = null
        val commandLine = CommandLine(analyser)
        commandLine.setExecutionExceptionHandler { exception, _, _ ->
            failureReason = exception.message ?: exception::class.simpleName
            FAILURE_EXIT_CODE
        }
        commandLine.setParameterExceptionHandler { exception, _ ->
            failureReason = exception.message
            FAILURE_EXIT_CODE
        }
        val errors = StringWriter()
        commandLine.err = PrintWriter(errors)
        val exitCode = commandLine.execute(*arguments.toTypedArray())
        if (exitCode == 0) return null
        return failureReason
            ?: (analyser as? FailableRun)?.failureMessage
            ?: errors.toString().lineSequence().firstOrNull { it.isNotBlank() }
            ?: "it ended with exit code $exitCode"
    }

    private fun excludePatternFor(projectFolder: File, outputFolder: File): String? {
        val relativeOutput = outputFolder.absoluteFile.normalize().relativeToOrNull(projectFolder.absoluteFile.normalize()) ?: return null
        if (relativeOutput.path.isEmpty() || relativeOutput.startsWith("..")) return null
        return "^/" + Regex.escape(relativeOutput.invariantSeparatorsPath) + "(/|$)"
    }

    companion object {
        private const val FAILURE_EXIT_CODE = 1
        private const val WORK_FOLDER_PREFIX = "codecharta-gate"
    }
}
