package de.maibornwolff.codecharta.analysers.tools.gate

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.tools.gate.analysis.ConfiguredAnalyser
import de.maibornwolff.codecharta.analysers.tools.gate.analysis.PicocliAnalyserCatalog
import de.maibornwolff.codecharta.analysers.tools.gate.analysis.ProjectAnalyser
import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigReader
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.report.ConsoleReport
import de.maibornwolff.codecharta.analysers.tools.gate.report.JsonReport
import de.maibornwolff.codecharta.analysers.tools.gate.report.counted
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedProject
import de.maibornwolff.codecharta.analysers.tools.gate.rules.CycleRuleEvaluator
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.MetricRuleEvaluator
import de.maibornwolff.codecharta.analysers.tools.gate.template.ConfigTemplate
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.File
import java.util.Locale
import kotlin.time.DurationUnit
import kotlin.time.measureTimedValue

class QualityGate(
    private val projectFolder: File,
    configFile: File?,
    private val console: GateConsole,
    private val createAnalysers: () -> List<AnalyserInterface>
) {
    private val configFile = configFile ?: File(projectFolder, GateConfig.FILE_NAME)
    private val configFolder = this.configFile.parentFile ?: File(".")
    private val catalog = PicocliAnalyserCatalog(createAnalysers)

    fun init(force: Boolean, parallel: Boolean, mapFile: File?): Int {
        if (configFile.exists() && !force) return failure("${configFile.path} already exists. Add --force to overwrite it.")
        val analysis = projectToCheck(GateConfig(parallel = parallel), mapFile) ?: return GateConfig.TOOL_FAILURE_EXIT_CODE
        val analyserNames = analysis.analyserNames.ifEmpty { catalog.names }
        configFile.writeText(ConfigTemplate(analysis.project.files, analyserNames, catalog).render())
        console.println("Wrote ${configFile.path}. Uncomment the rules you want, then run `ccsh gate --doctor`.")
        return SUCCESS
    }

    fun doctor(): Int {
        val config = readConfig() ?: return GateConfig.TOOL_FAILURE_EXIT_CODE
        console.println("${configFile.path} is valid.")
        if (!config.hasActiveRules) console.println(NO_ACTIVE_RULES)
        return SUCCESS
    }

    fun check(parallel: Boolean, mapFile: File?): Int {
        val readConfig = readConfig() ?: return GateConfig.TOOL_FAILURE_EXIT_CODE
        val config = if (parallel) readConfig.copy(parallel = true) else readConfig
        val analysis = projectToCheck(config, mapFile) ?: return GateConfig.TOOL_FAILURE_EXIT_CODE
        val result = evaluate(analysis.project, config)
        if (!config.hasActiveRules) console.println(NO_ACTIVE_RULES)
        ConsoleReport(console.output, config.configuredMetrics).print(result)
        val reportFile = File(
            outputFolder(config).apply { mkdirs() },
            REPORT_FILE_NAME
        ).apply { writeText(JsonReport.render(result, config)) }
        console.println("Report: ${reportFile.path}")
        return result.exitCode(config)
    }

    private fun projectToCheck(config: GateConfig, mapFile: File?): Analysis? = if (mapFile == null) analyse(config) else readMap(mapFile)

    private fun readMap(mapFile: File): Analysis? {
        if (!mapFile.isFile) return null.also { failure("The map ${mapFile.path} does not exist.") }
        val project =
            try {
                mapFile.inputStream().use { ProjectDeserializer.deserializeProject(it) }
            } catch (exception: Exception) {
                return null.also { failure("${mapFile.path} is not a readable cc.json map: ${exception.message}") }
            }
        val analysis = Analysis(AnalysedProject(project), emptyList())
        printSeparator("Map read: ${counted(analysis.project.files.size, "file")} from ${mapFile.path}")
        return analysis
    }

    private fun analyse(config: GateConfig): Analysis {
        val analysers = console.whileAnalysing { applicableAnalysers(config) }
        val analyserNames = analysers.map { it.analyser.name }
        console.announceAnalysis("Analysing ${analysisFolder(config).path} with ${analyserNames.joinToString()} ...")
        val (project, duration) = measureTimedValue { console.whileAnalysing { analyseAndKeepMap(analysers, config) } }
        val analysis = Analysis(AnalysedProject(project), analyserNames)
        val seconds = String.format(Locale.ROOT, "%.1f", duration.toDouble(DurationUnit.SECONDS))
        val analysed = counted(analysis.project.files.size, "file")
        printSeparator("Analysis done: $analysed with ${analyserNames.joinToString()} in $seconds s")
        return analysis
    }

    private fun analyseAndKeepMap(analysers: List<ConfiguredAnalyser>, config: GateConfig): Project {
        val outputFolder = outputFolder(config)
        val project = ProjectAnalyser().analyse(analysisFolder(config), analysers, outputFolder, config.parallel)
        outputFolder.mkdirs()
        ProjectSerializer.serializeToFileOrStream(project, File(outputFolder, MAP_FILE_NAME).path, console.output, true)
        return project
    }

    private fun printSeparator(line: String) {
        console.println()
        console.println(SEPARATOR)
        console.println(line)
        console.println()
    }

    private fun evaluate(project: AnalysedProject, config: GateConfig): GateResult {
        val violations =
            MetricRuleEvaluator(config).evaluate(project.files) +
                CycleRuleEvaluator(config.cycles).evaluate(project.dependencies, project.hasDependencyAnalysis)
        return GateResult(violations, project.files.size)
    }

    private fun readConfig(): GateConfig? {
        if (!configFile.exists()) return null.also { failure("No ${configFile.path} found. Run `ccsh gate --init` to create one.") }
        val result = ConfigReader(catalog, configFolder).read(configFile)
        if (result.problems.isEmpty()) return result.config

        console.println("${configFile.path} has ${result.problems.size} problem(s):")
        result.problems.forEach { console.println("  $it") }
        return null
    }

    private class Analysis(val project: AnalysedProject, val analyserNames: List<String>)

    private fun applicableAnalysers(config: GateConfig): List<ConfiguredAnalyser> = createAnalysers()
        .filter { config.isAnalyserEnabled(it.name) && it.isApplicable(analysisFolder(config).path) }
        .map { ConfiguredAnalyser(it, config.argumentsFor(it.name)) }

    private fun analysisFolder(config: GateConfig): File = config.input?.let { GateConfig.resolve(configFolder, it) } ?: projectFolder

    private fun outputFolder(config: GateConfig): File = GateConfig.resolve(configFolder, config.output)

    private fun failure(message: String): Int {
        console.println(message)
        return GateConfig.TOOL_FAILURE_EXIT_CODE
    }

    companion object {
        private const val SUCCESS = 0
        private const val MAP_FILE_NAME = "map.cc.json"
        private const val REPORT_FILE_NAME = "report.json"
        private val SEPARATOR = "─".repeat(72)
        private const val NO_ACTIVE_RULES = "No rule is active yet, so nothing is checked. Uncomment the rules you want in the config."
    }
}
