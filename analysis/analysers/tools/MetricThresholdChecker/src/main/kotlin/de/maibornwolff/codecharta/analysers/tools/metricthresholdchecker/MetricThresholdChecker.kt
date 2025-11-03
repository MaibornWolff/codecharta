package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.unified.ProjectScanner
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.io.PrintStream
import kotlin.system.exitProcess

@CommandLine.Command(
    name = MetricThresholdChecker.NAME,
    description = [MetricThresholdChecker.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class MetricThresholdChecker(
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : AnalyserInterface {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(index = "0", arity = "1", paramLabel = "FILE or FOLDER", description = ["file/folder to analyze"])
    private var inputPath: File? = null

    @CommandLine.Option(
        names = ["-c", "--config"],
        required = true,
        description = ["threshold configuration file (JSON or YAML)"]
    )
    private var configFile: File? = null

    @CommandLine.Option(names = ["--verbose"], description = ["verbose mode"])
    private var verbose = false

    @CommandLine.Option(
        names = ["-e", "--exclude"],
        description = ["comma-separated list of regex patterns to exclude files/folders"],
        split = ","
    )
    private var excludePatterns: List<String> = listOf()

    @CommandLine.Option(
        names = ["-fe", "--file-extensions"],
        description = ["comma-separated list of file-extensions to parse only those files (default: any)"],
        split = ","
    )
    private var fileExtensions: List<String> = listOf()

    @CommandLine.Option(
        names = ["--bypass-gitignore"],
        description = ["bypass .gitignore files and use regex-based exclusion instead (default: false)"]
    )
    private var bypassGitignore = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "metricthresholdchecker"
        const val DESCRIPTION = "validates code metrics against configured thresholds for CI/CD pipelines"

        @JvmStatic
        fun mainWithOutputStream(output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine(MetricThresholdChecker(output, error)).execute(*args)
        }
    }

    override fun call(): Unit? {
        require(InputHelper.isInputValidAndNotNull(arrayOf(inputPath), canInputContainFolders = true)) {
            "Input path is invalid for MetricThresholdChecker, stopping execution..."
        }

        require(configFile != null && configFile!!.exists()) {
            "Configuration file does not exist: ${configFile?.absolutePath}"
        }

        val thresholdConfig = loadThresholdConfiguration(configFile!!)
        val project = analyzeProject(inputPath!!)
        val violations = validateThresholds(project, thresholdConfig)

        printResults(violations, thresholdConfig)

        if (violations.isNotEmpty()) {
            exitProcess(1)
        }

        return null
    }

    private fun analyzeProject(inputPath: File): Project {
        if (verbose) {
            error.println("Analyzing project at: ${inputPath.absolutePath}")
        }

        val projectBuilder = ProjectBuilder()
        val useGitignore = !bypassGitignore

        val projectScanner = ProjectScanner(
            inputPath,
            projectBuilder,
            excludePatterns,
            fileExtensions,
            emptyMap(),
            useGitignore
        )

        projectScanner.traverseInputProject(verbose)

        if (!projectScanner.foundParsableFiles()) {
            Logger.warn { "No parsable files found in the given input path" }
        }

        return projectBuilder.build()
    }

    private fun loadThresholdConfiguration(configFile: File): ThresholdConfiguration {
        return ThresholdConfigurationLoader.load(configFile)
    }

    private fun validateThresholds(project: Project, config: ThresholdConfiguration): List<ThresholdViolation> {
        val validator = ThresholdValidator(config)
        return validator.validate(project)
    }

    private fun printResults(violations: List<ThresholdViolation>, config: ThresholdConfiguration) {
        val formatter = ViolationFormatter(output, error)
        formatter.printResults(violations, config)
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
