package de.maibornwolff.codecharta.analysers.tools.gate

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.tools.gate.analysis.PicocliAnalyserCatalog
import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigReader
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateException
import de.maibornwolff.codecharta.analysers.tools.gate.report.ConsoleReport
import de.maibornwolff.codecharta.analysers.tools.gate.report.JsonReport
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedProject
import de.maibornwolff.codecharta.analysers.tools.gate.rules.CycleRuleEvaluator
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.MetricRuleEvaluator
import de.maibornwolff.codecharta.analysers.tools.gate.template.ConfigTemplate
import java.io.File

class QualityGate(private val options: GateOptions, private val console: GateConsole, createAnalysers: () -> List<AnalyserInterface>) {
    private val configFile = options.configFile ?: File(options.projectFolder, GateConfig.FILE_NAME)
    private val catalog = PicocliAnalyserCatalog(createAnalysers)
    private val projectSource = ProjectSource(options, console, createAnalysers)

    fun init(force: Boolean): Int {
        if (configFile.exists() && !force) throw GateException("${configFile.path} already exists. Add --force to overwrite it.")
        val loaded = projectSource.load(GateConfig(parallel = options.parallel))
        val analyserNames = loaded.analyserNames.ifEmpty { catalog.names }
        configFile.writeText(ConfigTemplate(loaded.project.files, analyserNames, catalog).render())
        console.println("Wrote ${configFile.path}. Uncomment the rules you want, then run `ccsh gate --doctor`.")
        return SUCCESS
    }

    fun doctor(): Int {
        val config = readConfig()
        console.println("${configFile.path} is valid.")
        if (!config.hasActiveRules) console.println(NO_ACTIVE_RULES)
        return SUCCESS
    }

    fun check(): Int {
        val configFromFile = readConfig()
        val config = if (options.parallel) configFromFile.copy(parallel = true) else configFromFile
        val result = evaluate(projectSource.load(config).project, config)
        if (!config.hasActiveRules) console.println(NO_ACTIVE_RULES)
        ConsoleReport(console.output, config.configuredMetrics).print(result)
        val reportFile = File(projectSource.outputFolder(config).apply { mkdirs() }, REPORT_FILE_NAME)
        reportFile.writeText(JsonReport.render(result, config))
        console.println("Report: ${reportFile.path}")
        return result.exitCode(config)
    }

    private fun evaluate(project: AnalysedProject, config: GateConfig): GateResult {
        val violations =
            MetricRuleEvaluator(config).evaluate(project.files) +
                CycleRuleEvaluator(config.cycles).evaluate(project.dependencyAnalysis)
        return GateResult(violations, project.files.size)
    }

    private fun readConfig(): GateConfig {
        if (!configFile.exists()) throw GateException("No ${configFile.path} found. Run `ccsh gate --init` to create one.")
        val inputBase = if (options.mapFile == null) options.projectFolder else null
        val result = ConfigReader(catalog, inputBase).read(configFile)
        if (result.problems.isEmpty()) return result.config
        val problems = result.problems.joinToString("\n") { "  $it" }
        throw GateException("${configFile.path} has ${result.problems.size} problem(s):\n$problems")
    }

    companion object {
        private const val SUCCESS = 0
        private const val REPORT_FILE_NAME = "report.json"
        private const val NO_ACTIVE_RULES = "No rule is active yet, so nothing is checked. Uncomment the rules you want in the config."
    }
}
