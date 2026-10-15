package de.maibornwolff.codecharta.analysers.tools.gate

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.tools.gate.analysis.ProjectAnalyser
import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigReader
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.report.ConsoleReport
import de.maibornwolff.codecharta.analysers.tools.gate.report.JsonReport
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedProject
import de.maibornwolff.codecharta.analysers.tools.gate.rules.CycleRuleEvaluator
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.MetricRuleEvaluator
import de.maibornwolff.codecharta.analysers.tools.gate.template.ConfigTemplate
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.File
import java.util.Locale
import kotlin.time.Duration
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

    fun init(force: Boolean): Int {
        if (configFile.exists() && !force) return failure("${configFile.path} already exists. Add --force to overwrite it.")
        val analysis = analyse(GateConfig())
        configFile.writeText(ConfigTemplate(analysis.project.files, analysis.analyserNames).render())
        console.println("Wrote ${configFile.path}. Uncomment the rules you want, then run `ccsh gate --doctor`.")
        return SUCCESS
    }

    fun doctor(): Int {
        val config = readConfig() ?: return GateConfig.TOOL_FAILURE_EXIT_CODE
        console.println("${configFile.path} is valid.")
        if (!config.hasActiveRules) console.println(NO_ACTIVE_RULES)
        return SUCCESS
    }

    fun check(): Int {
        val config = readConfig() ?: return GateConfig.TOOL_FAILURE_EXIT_CODE
        val analysis = analyse(config)
        val result = evaluate(analysis.project, config)
        if (!config.hasActiveRules) console.println(NO_ACTIVE_RULES)
        ConsoleReport(console.output, config.configuredMetrics).print(result)
        val reportFile = File(outputFolder(config), REPORT_FILE_NAME).apply { writeText(JsonReport.render(result, config)) }
        console.println("Report: ${reportFile.path}")
        return result.exitCode(config)
    }

    private fun analyse(config: GateConfig): Analysis {
        val analysers = console.whileAnalysing { applicableAnalysers(config) }
        val analyserNames = analysers.map { it.name }
        console.announceAnalysis("Analysing ${analysisFolder(config).path} with ${analyserNames.joinToString()} ...")
        val (project, duration) = measureTimedValue { console.whileAnalysing { analyseAndKeepMap(analysers, config) } }
        val analysis = Analysis(AnalysedProject(project), analyserNames)
        printAnalysisDone(analysis, duration)
        return analysis
    }

    private fun analyseAndKeepMap(analysers: List<AnalyserInterface>, config: GateConfig): Project {
        val outputFolder = outputFolder(config)
        val project = ProjectAnalyser().analyse(analysisFolder(config), analysers, outputFolder)
        outputFolder.mkdirs()
        ProjectSerializer.serializeToFileOrStream(project, File(outputFolder, MAP_FILE_NAME).path, console.output, true)
        return project
    }

    private fun printAnalysisDone(analysis: Analysis, duration: Duration) {
        val seconds = String.format(Locale.ROOT, "%.1f", duration.toDouble(DurationUnit.SECONDS))
        console.println()
        console.println(SEPARATOR)
        console.println("Analysis done: ${analysis.project.files.size} files with ${analysis.analyserNames.joinToString()} in $seconds s")
        console.println()
    }

    private fun evaluate(project: AnalysedProject, config: GateConfig): GateResult {
        val violations =
            MetricRuleEvaluator(config).evaluate(project.files) + CycleRuleEvaluator(config.cycles).evaluate(project.dependencies)
        return GateResult(violations, project.files.size)
    }

    private fun readConfig(): GateConfig? {
        if (!configFile.exists()) return null.also { failure("No ${configFile.path} found. Run `ccsh gate --init` to create one.") }
        val knownAnalysers = createAnalysers().map { it.name }.toSet()
        val result = ConfigReader(knownAnalysers, configFolder).read(configFile)
        if (result.problems.isEmpty()) return result.config

        console.println("${configFile.path} has ${result.problems.size} problem(s):")
        result.problems.forEach { console.println("  $it") }
        return null
    }

    private class Analysis(val project: AnalysedProject, val analyserNames: List<String>)

    private fun applicableAnalysers(config: GateConfig): List<AnalyserInterface> =
        createAnalysers().filter { config.isAnalyserEnabled(it.name) && it.isApplicable(analysisFolder(config).path) }

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
