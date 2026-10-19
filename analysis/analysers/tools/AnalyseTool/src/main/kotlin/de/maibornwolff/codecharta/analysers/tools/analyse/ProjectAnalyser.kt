package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.failures.FailableRun
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeResolverStrategy
import de.maibornwolff.codecharta.analysers.filters.mergefilter.ProjectMerger
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

class AnalysisException(message: String) : RuntimeException(message)

data class ConfiguredAnalyser(
    val analyser: AnalyserInterface,
    val arguments: List<String> = emptyList(),
    val readsProjectFolder: Boolean = true
)

class ProjectAnalyser {
    fun analyse(projectFolder: File, analysers: List<ConfiguredAnalyser>, excludedOutput: File, parallel: Boolean = false): Project {
        val projects = inWorkFolder(projectFolder, analysers, excludedOutput) { runOne ->
            if (parallel) runInParallel(analysers, runOne).map { it.getOrThrow() } else analysers.map { runOne(it).getOrThrow() }
        }
        return ProjectMerger(projects, MergeResolverStrategy.recursive()).merge()
    }

    fun analyseEach(
        projectFolder: File,
        analysers: List<ConfiguredAnalyser>,
        excludedOutput: File,
        parallel: Boolean = false
    ): List<Result<Project>> = inWorkFolder(projectFolder, analysers, excludedOutput) { runOne ->
        if (parallel) runInParallel(analysers, runOne) else analysers.map(runOne)
    }

    private fun <T> inWorkFolder(
        projectFolder: File,
        analysers: List<ConfiguredAnalyser>,
        excludedOutput: File,
        runAll: (runOne: (ConfiguredAnalyser) -> Result<Project>) -> T
    ): T {
        if (analysers.isEmpty()) throw AnalysisException("No analyser is switched on that applies to ${projectFolder.path}.")

        val workFolder = createTempDirectory(WORK_FOLDER_PREFIX).toFile()
        try {
            val excludePattern = excludePatternFor(projectFolder, excludedOutput)
            return runAll { analyser -> attempt { runAnalyser(analyser, projectFolder, workFolder, excludePattern) } }
        } finally {
            workFolder.deleteRecursively()
        }
    }

    private fun attempt(run: () -> Project): Result<Project> = try {
        Result.success(run())
    } catch (exception: AnalysisException) {
        Result.failure(exception)
    }

    private fun runInParallel(analysers: List<ConfiguredAnalyser>, runOne: (ConfiguredAnalyser) -> Result<Project>): List<Result<Project>> {
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

    private fun resultOf(future: Future<Result<Project>>): Result<Project> = try {
        future.get()
    } catch (exception: ExecutionException) {
        throw exception.cause ?: exception
    }

    private fun runAnalyser(configured: ConfiguredAnalyser, projectFolder: File, workFolder: File, excludePattern: String?): Project {
        val analyser = configured.analyser
        val mapFile = File(workFolder, analyser.name + FileExtension.CCJSON.primaryExtension)
        val arguments = inputArguments(configured, projectFolder, excludePattern) + listOf("--output-file", mapFile.path)
        val failureReason = execute(analyser, arguments)
        val writtenFile = File(OutputFileHandler.checkAndFixFileExtension(mapFile.path, true, FileExtension.JSON))
        if (failureReason != null || !writtenFile.exists()) {
            throw AnalysisException("The analyser ${analyser.name} failed on ${projectFolder.path}: ${failureReason ?: "it wrote no map"}")
        }
        return writtenFile.inputStream().use { ProjectDeserializer.deserializeProject(it) }
    }

    private fun inputArguments(configured: ConfiguredAnalyser, projectFolder: File, excludePattern: String?): List<String> {
        if (!configured.readsProjectFolder) return configured.arguments
        return listOf(projectFolder.path) + configured.arguments + listOfNotNull(excludePattern?.let { "--exclude=$it" })
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

    private fun excludePatternFor(projectFolder: File, excludedOutput: File): String? {
        val relativeOutput = excludedOutput.absoluteFile.normalize().relativeToOrNull(projectFolder.absoluteFile.normalize()) ?: return null
        if (relativeOutput.path.isEmpty() || relativeOutput.startsWith("..")) return null
        return "^/" + Regex.escape(relativeOutput.invariantSeparatorsPath) + "(/|$)"
    }

    companion object {
        private const val FAILURE_EXIT_CODE = 1
        private const val WORK_FOLDER_PREFIX = "codecharta-analysis"
    }
}
