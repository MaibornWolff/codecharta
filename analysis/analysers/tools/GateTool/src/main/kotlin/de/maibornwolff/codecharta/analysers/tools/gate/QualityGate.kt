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
import java.io.PrintStream

class QualityGate(
    private val projectFolder: File,
    configFile: File?,
    private val output: PrintStream,
    private val createAnalysers: () -> List<AnalyserInterface>
) {
    private val configFile = configFile ?: File(projectFolder, GateConfig.FILE_NAME)

    fun init(force: Boolean): Int {
        if (configFile.exists() && !force) return failure("${configFile.path} already exists. Add --force to overwrite it.")
        val analysers = applicableAnalysers(GateConfig())
        val project = analyse(analysers, GateConfig())
        configFile.writeText(ConfigTemplate(AnalysedProject(project).files, analysers.map { it.name }).render())
        output.println("Wrote ${configFile.path}. Uncomment the rules you want, then run `ccsh gate --doctor`.")
        return SUCCESS
    }

    fun doctor(): Int {
        val config = readConfig() ?: return GateConfig.TOOL_FAILURE_EXIT_CODE
        output.println("${configFile.path} is valid.")
        if (!config.hasActiveRules) output.println(NO_ACTIVE_RULES)
        return SUCCESS
    }

    fun check(): Int {
        val config = readConfig() ?: return GateConfig.TOOL_FAILURE_EXIT_CODE
        val project = analyse(applicableAnalysers(config), config)
        val outputFolder = outputFolder(config).apply { mkdirs() }
        ProjectSerializer.serializeToFileOrStream(project, File(outputFolder, MAP_FILE_NAME).path, output, true)

        val result = evaluate(AnalysedProject(project), config)
        if (!config.hasActiveRules) output.println(NO_ACTIVE_RULES)
        ConsoleReport(output).print(result)
        val reportFile = File(outputFolder, REPORT_FILE_NAME).apply { writeText(JsonReport.render(result, config)) }
        output.println("Report: ${reportFile.path}")
        return result.exitCode(config)
    }

    private fun evaluate(project: AnalysedProject, config: GateConfig): GateResult {
        val violations =
            MetricRuleEvaluator(config).evaluate(project.files) + CycleRuleEvaluator(config.cycles).evaluate(project.dependencies)
        return GateResult(violations, project.files.size)
    }

    private fun readConfig(): GateConfig? {
        if (!configFile.exists()) return null.also { failure("No ${configFile.path} found. Run `ccsh gate --init` to create one.") }
        val knownAnalysers = createAnalysers().map { it.name }.toSet()
        val result = ConfigReader(knownAnalysers).read(configFile)
        if (result.problems.isEmpty()) return result.config

        output.println("${configFile.path} has ${result.problems.size} problem(s):")
        result.problems.forEach { output.println("  $it") }
        return null
    }

    private fun applicableAnalysers(config: GateConfig): List<AnalyserInterface> =
        createAnalysers().filter { config.isAnalyserEnabled(it.name) && it.isApplicable(projectFolder.path) }

    private fun analyse(analysers: List<AnalyserInterface>, config: GateConfig): Project =
        ProjectAnalyser().analyse(projectFolder, analysers, outputFolder(config))

    private fun outputFolder(config: GateConfig): File = File(config.output).let {
        if (it.isAbsolute) it else File(projectFolder, config.output)
    }

    private fun failure(message: String): Int {
        output.println(message)
        return GateConfig.TOOL_FAILURE_EXIT_CODE
    }

    companion object {
        private const val SUCCESS = 0
        private const val MAP_FILE_NAME = "map.cc.json"
        private const val REPORT_FILE_NAME = "report.json"
        private const val NO_ACTIVE_RULES = "No rule is active yet, so nothing is checked. Uncomment the rules you want in the config."
    }
}
