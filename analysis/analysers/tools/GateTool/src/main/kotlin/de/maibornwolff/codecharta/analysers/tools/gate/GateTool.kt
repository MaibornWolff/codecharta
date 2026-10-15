package de.maibornwolff.codecharta.analysers.tools.gate

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.dependency.DependencyParser
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.DomainLanguageParser
import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.io.PrintStream

@CommandLine.Command(
    name = GateTool.NAME,
    description = [GateTool.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class GateTool(
    private val output: PrintStream = System.out,
    private val createAnalysers: () -> List<AnalyserInterface> = ::defaultAnalysers
) : AnalyserInterface,
    CommandLine.IExitCodeGenerator {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FOLDER", description = [FOLDER_DESCRIPTION])
    private var projectFolder: File = File(".")

    @CommandLine.Option(names = ["-c", "--config"], description = [CONFIG_DESCRIPTION])
    private var configFile: File? = null

    @CommandLine.Spec
    private lateinit var spec: CommandLine.Model.CommandSpec

    private var exitCode = 0

    override val name = NAME
    override val description = DESCRIPTION

    override fun call(): Unit? {
        if (spec.commandLine().parseResult.subcommand() != null) return null
        exitCode = guarded { QualityGate(projectFolder, configFile, output, createAnalysers).check() }
        return null
    }

    @CommandLine.Command(name = "init", description = ["analyses the project and writes a fully commented-out ${GateConfig.FILE_NAME}"])
    fun init(
        @CommandLine.Parameters(arity = "0..1", paramLabel = "FOLDER", description = [FOLDER_DESCRIPTION]) folder: File?,
        @CommandLine.Option(names = ["-c", "--config"], description = [CONFIG_DESCRIPTION]) config: File?,
        @CommandLine.Option(names = ["-f", "--force"], description = ["overwrites an existing config"]) force: Boolean
    ) {
        exitCode = guarded { QualityGate(folder ?: File("."), config, output, createAnalysers).init(force) }
    }

    @CommandLine.Command(name = "doctor", description = ["validates the config without analysing the project"])
    fun doctor(
        @CommandLine.Parameters(arity = "0..1", paramLabel = "FOLDER", description = [FOLDER_DESCRIPTION]) folder: File?,
        @CommandLine.Option(names = ["-c", "--config"], description = [CONFIG_DESCRIPTION]) config: File?
    ) {
        exitCode = guarded { QualityGate(folder ?: File("."), config, output, createAnalysers).doctor() }
    }

    override fun getExitCode(): Int = exitCode

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean = false

    private fun guarded(action: () -> Int): Int = try {
        action()
    } catch (exception: Exception) {
        Logger.error { "ccsh gate failed: ${exception.message}" }
        GateConfig.TOOL_FAILURE_EXIT_CODE
    }

    companion object {
        const val NAME = "gate"
        const val DESCRIPTION = "checks a project against the metric and cycle rules in its ${GateConfig.FILE_NAME}"
        private const val FOLDER_DESCRIPTION = "project folder (default: the current folder)"
        private const val CONFIG_DESCRIPTION = "config file (default: ${GateConfig.FILE_NAME} in the project folder)"

        fun defaultAnalysers(): List<AnalyserInterface> =
            listOf(RawTextParser(), UnifiedParser(), DependencyParser(), DomainLanguageParser())
    }
}
