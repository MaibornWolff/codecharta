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
    private val workingFolder: File = File("."),
    private val createAnalysers: () -> List<AnalyserInterface> = ::defaultAnalysers
) : AnalyserInterface,
    CommandLine.IExitCodeGenerator {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FOLDER", description = ["project folder (default: the current folder)"])
    private var projectFolder: File? = null

    @CommandLine.Option(names = ["-c", "--config"], description = ["config file (default: ${GateConfig.FILE_NAME} in the project folder)"])
    private var configFile: File? = null

    @CommandLine.Option(names = ["--init"], description = ["analyses the project and writes a fully commented-out ${GateConfig.FILE_NAME}"])
    private var init = false

    @CommandLine.Option(names = ["--doctor"], description = ["validates the config without analysing the project"])
    private var doctor = false

    @CommandLine.Option(names = ["-f", "--force"], description = ["lets --init overwrite an existing config"])
    private var force = false

    @CommandLine.Option(names = ["-m", "--map"], description = ["checks this cc.json map instead of analysing the project"])
    private var mapFile: File? = null

    @CommandLine.Option(names = ["-p", "--parallel"], description = ["runs the analysers at the same time"])
    private var parallel = false

    @CommandLine.Option(names = ["-q", "--quiet"], description = ["keeps the output of the analysers off the console"])
    private var quiet = false

    private var exitCode = 0

    override val name = NAME
    override val description = DESCRIPTION

    override fun call(): Unit? {
        exitCode = guarded(::run)
        return null
    }

    private fun run(): Int {
        val folder = projectFolder ?: workingFolder
        usageProblem(folder)?.let { message ->
            output.println(message)
            return GateConfig.TOOL_FAILURE_EXIT_CODE
        }
        val gate = QualityGate(folder, configFile, GateConsole(output, quiet), createAnalysers)
        return when {
            init -> gate.init(force, parallel, mapFile)
            doctor -> gate.doctor()
            else -> gate.check(parallel, mapFile)
        }
    }

    private fun usageProblem(folder: File): String? = when {
        init && doctor -> "Use either --init or --doctor, not both."
        force && !init -> "--force only works with --init."
        !folder.isDirectory -> "The folder ${folder.path} does not exist."
        else -> null
    }

    override fun getExitCode(): Int = exitCode

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean = false

    override fun shouldAskForArguments(): Boolean = !File(workingFolder, GateConfig.FILE_NAME).exists()

    private fun guarded(action: () -> Int): Int = try {
        action()
    } catch (exception: Exception) {
        Logger.error { "ccsh gate failed: ${exception.message}" }
        GateConfig.TOOL_FAILURE_EXIT_CODE
    }

    companion object {
        const val NAME = "gate"
        const val DESCRIPTION = "checks a project against the metric and cycle rules in its ${GateConfig.FILE_NAME}"

        fun defaultAnalysers(): List<AnalyserInterface> =
            listOf(RawTextParser(), UnifiedParser(), DependencyParser(), DomainLanguageParser())
    }
}
