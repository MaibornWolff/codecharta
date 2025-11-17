package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.config.ThresholdConfigurationLoader
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdConfiguration
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.ViolationFormatter
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.validation.ThresholdValidator
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
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

    @CommandLine.Option(
        names = ["-ibf", "--include-build-folders"],
        description = [
            "include build folders (out, build, dist and target) and " +
                "common resource folders (e.g. resources, node_modules or files/folders starting with '.')"
        ]
    )
    private var includeBuildFolders = false

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

        if (verbose) {
            error.println("Analyzing project at: ${inputPath!!.absolutePath}")
        }

        val project = UnifiedParser.parse(
            inputFile = inputPath!!,
            excludePatterns = excludePatterns,
            fileExtensions = fileExtensions,
            bypassGitignore = bypassGitignore,
            includeBuildFolders = includeBuildFolders,
            verbose = verbose
        )

        val violations = validateThresholds(project, thresholdConfig)

        printResults(violations, thresholdConfig, project.attributeDescriptors)

        if (violations.isNotEmpty()) {
            exitProcess(1)
        }

        return null
    }

    private fun loadThresholdConfiguration(configFile: File): ThresholdConfiguration {
        return ThresholdConfigurationLoader.load(configFile)
    }

    private fun validateThresholds(project: Project, config: ThresholdConfiguration): List<ThresholdViolation> {
        val validator = ThresholdValidator(config)
        return validator.validate(project)
    }

    private fun printResults(
        violations: List<ThresholdViolation>,
        config: ThresholdConfiguration,
        attributeDescriptors: Map<String, de.maibornwolff.codecharta.model.AttributeDescriptor>
    ) {
        val formatter = ViolationFormatter(output, error)
        formatter.printResults(violations, config, attributeDescriptors)
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
