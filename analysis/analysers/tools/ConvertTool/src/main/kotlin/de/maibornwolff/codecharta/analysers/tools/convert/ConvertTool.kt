package de.maibornwolff.codecharta.analysers.tools.convert

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ApiVersion
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.io.InputStream
import java.io.PrintStream

@CommandLine.Command(
    name = ConvertTool.NAME,
    description = [ConvertTool.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class ConvertTool(private val input: InputStream = System.`in`, private val output: PrintStream = System.out) : AnalyserInterface {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FILE", description = ["input project file (1.5 or 2.0)"])
    private var source: File? = null

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "convert"
        const val DESCRIPTION = "converts cc.json files to the latest 2.0 {meta, files, lenses} format"

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, args: Array<String>) {
            CommandLine(ConvertTool(input, output)).execute(*args)
        }
    }

    override fun call(): Unit? {
        val project = readProject() ?: return null
        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress, ApiVersion.TWO_ZERO)
        return null
    }

    private fun readProject(): Project? {
        if (source == null) {
            return ProjectDeserializer.deserializeProject(input)
        }

        require(InputHelper.isInputValid(arrayOf(source!!), canInputContainFolders = false)) {
            "Input invalid file for ConvertTool, stopping execution..."
        }

        return try {
            ProjectDeserializer.deserializeProject(source!!.inputStream())
        } catch (e: Exception) {
            Logger.error { "${source!!.name} is not a valid project file and is therefore skipped." }
            null
        }
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean = false
}
