package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.analysers.tools.inspection.ProjectStructurePrinter
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CommaSeparatedParameterPreprocessor
import de.maibornwolff.codecharta.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.io.InputStream
import java.io.PrintStream

@CommandLine.Command(
    name = StructureModifier.NAME,
    description = [StructureModifier.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class StructureModifier(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out
) : AnalyserInterface {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FILE", description = ["input project file"])
    private var source: File? = null

    @CommandLine.Option(
        names = ["-s", "--set-root"],
        description = ["path within project to be extracted as the new root"]
    )
    private var setRoot: String? = null

    @CommandLine.Option(
        names = ["-p", "--print-levels"],
        description = ["show first x layers of project hierarchy (deprecated; use command 'inspect' instead)"]
    )
    private var printLevels: Int? = null

    @CommandLine.Option(
        names = ["--rename-mcc"],
        arity = "0..1",
        description = [
            "rename the mcc metric to complexity. " +
                "Optionally specify 'sonar' for it to be renamed to sonar_complexity"
        ]
    )
    private var renameMcc: String? = null

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-f", "--move-from"], description = ["move nodes in project folder..."])
    private var moveFrom: String? = null

    @CommandLine.Option(
        names = ["-r", "--remove"],
        description = [
            "comma-separated list of nodes to be removed" +
                " (when using powershell, the list either can't contain spaces or has to be in quotes)"
        ],
        converter = [(CommaSeparatedStringToListConverter::class)],
        preprocessor = CommaSeparatedParameterPreprocessor::class
    )
    private var remove: Array<String> = arrayOf()

    @CommandLine.Option(names = ["-t", "--move-to"], description = ["... move nodes to destination folder"])
    private var moveTo: String? = null

    private lateinit var project: Project

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "modify"
        const val DESCRIPTION = "changes the structure of cc.json files"

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, args: Array<String>) {
            CommandLine(StructureModifier(input, output)).execute(*args)
        }
    }

    override fun call(): Unit? {
        if (isMoreThanOneActionSpecified()) {
            Logger.error {
                "More than one action specified - aborting execution."
            }
            return null
        }

        project = readProject() ?: return null

        when {
            printLevels != null -> {
                ProjectStructurePrinter(project, output).printProjectStructure(printLevels!!)
                return null
            }

            setRoot != null -> project = SubProjectExtractor(project).extract(setRoot!!)
            renameMcc != null -> {
                project =
                    if (renameMcc == "sonar") {
                        MetricRenamer(project, "sonar_complexity").rename()
                    } else if (renameMcc == "") {
                        MetricRenamer(project).rename()
                    } else {
                        throw IllegalArgumentException("Invalid value for rename flag, stopping execution...")
                    }
            }
            remove.isNotEmpty() -> project = NodeRemover(project).remove(remove)
            moveFrom != null -> project = FolderMover(project).move(moveFrom, moveTo) ?: return null
        }

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, false)

        return null
    }

    private fun isMoreThanOneActionSpecified(): Boolean {
        var actionCount = 0
        actionCount += if (setRoot != null) 1 else 0
        actionCount += if (printLevels != null) 1 else 0
        actionCount += if (moveFrom != null || moveTo != null) 1 else 0
        actionCount += if (remove.isNotEmpty()) 1 else 0
        return actionCount > 1
    }

    private fun readProject(): Project? {
        if (source == null) {
            return ProjectDeserializer.deserializeProject(input)
        }

        require(InputHelper.isInputValid(arrayOf(source!!), canInputContainFolders = false)) {
            "Input invalid file for StructureModifier, stopping execution..."
        }

        val input = source!!.inputStream()
        return try {
            ProjectDeserializer.deserializeProject(input)
        } catch (e: Exception) {
            val sourceName = source!!.name
            Logger.error {
                "$sourceName is not a valid project file and is therefore skipped."
            }
            null
        }
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
