package de.maibornwolff.codecharta.analysers.tools.gate

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.tools.gate.analysis.PicocliAnalyserCatalog
import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigReader
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateException
import de.maibornwolff.codecharta.analysers.tools.gate.report.ConsoleReport
import de.maibornwolff.codecharta.analysers.tools.gate.report.JsonReport
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedProject
import de.maibornwolff.codecharta.analysers.tools.gate.rules.DependencyRuleEvaluator
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.MetricRuleEvaluator
import de.maibornwolff.codecharta.analysers.tools.gate.rules.PathPatterns
import de.maibornwolff.codecharta.analysers.tools.gate.rules.UnmatchedPatternFinder
import de.maibornwolff.codecharta.analysers.tools.gate.template.ConfigTemplate
import de.maibornwolff.codecharta.analysers.tools.gate.template.MetricSummary
import java.io.File

class QualityGate(private val options: GateOptions, private val console: GateConsole, createAnalysers: () -> List<AnalyserInterface>) {
    private val configFile = options.configFile ?: File(options.projectFolder, GateConfig.FILE_NAME)
    private val catalog = PicocliAnalyserCatalog(createAnalysers)
    private val projectSource = ProjectSource(options, console, createAnalysers)

    fun init(force: Boolean): Int {
        if (configFile.exists() && !force) throw GateException("${configFile.path} already exists. Add --force to overwrite it.")
        val loaded = projectSource.load(GateConfig(parallel = options.parallel))
        val analyserNames = loaded.analyserNames.ifEmpty { catalog.names }
        val metrics = MetricSummary.allOf(loaded.project.files, loaded.project.metricTitles)
        configFile.writeText(ConfigTemplate(metrics, analyserNames, catalog).render())
        console.println("Wrote ${configFile.path}. Uncomment the rules you want, then run `ccsh gate --doctor`.")
        gitignoreHint()?.let(console::println)
        printWrittenMap(loaded)
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
        val loaded = projectSource.load(config)
        val result = evaluate(loaded.project, config)
        if (!config.hasActiveRules) console.println(NO_ACTIVE_RULES)
        ConsoleReport(console.output, config.configuredMetrics).print(result)
        val reportFile = File(projectSource.outputFolder(config).apply { mkdirs() }, REPORT_FILE_NAME)
        reportFile.writeText(JsonReport.render(result, config))
        console.println("Report: ${reportFile.path}")
        printWrittenMap(loaded)
        return result.exitCode(config)
    }

    private fun printWrittenMap(loaded: LoadedProject) {
        loaded.writtenMap?.let { console.println("Map: ${it.path}") }
    }

    private fun gitignoreHint(): String? {
        val gitignore = File(options.projectFolder, GITIGNORE)
        val outputFolder = GateConfig.DEFAULT_OUTPUT
        if (!gitignore.isFile || gitignore.readLines().any { it.trim().trim('/') == outputFolder }) return null
        return "Add $outputFolder/ to ${gitignore.path} so the gate's map and report stay out of version control."
    }

    private fun evaluate(project: AnalysedProject, config: GateConfig): GateResult {
        val excluded = PathPatterns(config.exclude)
        val files = project.files.filterNot { excluded.matches(it.path) }
        val dependencyAnalysis = project.dependencyAnalysis?.withoutFiles(excluded::matches)
        val violations =
            MetricRuleEvaluator(config).evaluate(files) +
                DependencyRuleEvaluator(config.dependencies).evaluate(dependencyAnalysis) +
                UnmatchedPatternFinder(project.files.map { it.path }).find(config)
        return GateResult(violations, files.size)
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
        private const val GITIGNORE = ".gitignore"
        private const val NO_ACTIVE_RULES = "No rule is active yet, so nothing is checked. Uncomment the rules you want in the config."
    }
}
