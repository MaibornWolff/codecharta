package de.maibornwolff.codecharta.analysers.filters.edgefilter

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.io.PrintStream

@CommandLine.Command(
    name = EdgeFilter.NAME,
    description = [EdgeFilter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class EdgeFilter(
    private val output: PrintStream = System.out
) : AnalyserInterface {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["files to filter"])
    private var source: File? = null

    @CommandLine.Option(names = ["--path-separator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "edgefilter"
        const val DESCRIPTION = "aggregates edgeAttributes as nodeAttributes into a new cc.json file"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(EdgeFilter()).execute(*args)
        }
    }

    override fun call(): Unit? {
        if (!InputHelper.isInputValidAndNotNull(arrayOf(source), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for EdgeFilter, stopping execution...")
        }

        val srcProject = ProjectDeserializer.deserializeProject(source!!.inputStream())

        val newProject = EdgeProjectBuilder(srcProject, pathSeparator).merge()

        ProjectSerializer.serializeToFileOrStream(newProject, outputFile, output, false)

        return null
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
