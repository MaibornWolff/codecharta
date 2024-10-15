package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.io.PrintStream
import java.util.concurrent.Callable

@CommandLine.Command(
    name = MergeFilter.NAME,
    description = [MergeFilter.DESCRIPTION],
    footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class MergeFilter(
    private val output: PrintStream = System.out
) : Callable<Unit?>, InteractiveParser {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE or FOLDER", description = ["files to merge"])
    private var sources: Array<File> = arrayOf()

    @CommandLine.Option(names = ["-a", "--add-missing"], description = ["enable adding missing nodes to reference"])
    private var addMissingNodes = false

    @CommandLine.Option(names = ["--recursive"], description = ["recursive merging strategy (default)"])
    private var recursiveStrategySet = true

    @CommandLine.Option(names = ["--leaf"], description = ["leaf merging strategy"])
    private var leafStrategySet = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["--ignore-case"], description = ["ignores case when checking node names"])
    private var ignoreCase = false

    @CommandLine.Option(names = ["-f"], description = ["force merge non-overlapping modules at the top-level structure"])
    private var mergeModules = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "merge"
        const val DESCRIPTION = "merges multiple cc.json files"

        fun mergePipedWithCurrentProject(pipedProject: Project, currentProject: Project): Project {
            return ProjectMerger(
                listOf(pipedProject, currentProject),
                RecursiveNodeMergerStrategy(false)
            ).merge()
        }

        @JvmStatic
        fun main(args: Array<String>) {
            Logger.info { "Starting merge process..." }
            CommandLine(MergeFilter()).execute(*args)
        }
    }

    override fun call(): Unit? {
        val nodeMergerStrategy = when {
            leafStrategySet -> LeafNodeMergerStrategy(addMissingNodes, ignoreCase)
            recursiveStrategySet && !leafStrategySet -> RecursiveNodeMergerStrategy(ignoreCase)
            else -> throw IllegalArgumentException("Only one merging strategy must be set")
        }

        if (!InputHelper.isInputValid(sources, canInputContainFolders = true)) {
            throw IllegalArgumentException("Input invalid files/folders for MergeFilter, stopping execution...")
        }
        val sourceFiles = InputHelper.getFileListFromValidatedResourceArray(sources)

        val rootChildrenNodes = sourceFiles.mapNotNull {
            val input = it.inputStream()
            try {
                ProjectDeserializer.deserializeProject(input)
            } catch (e: Exception) {
                Logger.warn { "${it.name} is not a valid project file and will be skipped." }
                null
            }
        }

        if (!mergeModules) {
            if (!hasTopLevelOverlap(rootChildrenNodes)) {
                printOverlapError(rootChildrenNodes)

                val continueMerge = ParserDialog.askForceMerge()

                if (!continueMerge) {
                    Logger.info { "Merge cancelled by the user." }
                    return null
                }
            }
        }

        val mergedProject = ProjectMerger(rootChildrenNodes, nodeMergerStrategy).merge()
        ProjectSerializer.serializeToFileOrStream(mergedProject, outputFile, output, compress)

        return null
    }

    private fun hasTopLevelOverlap(projects: List<Project>): Boolean {
        val topLevelNodesSets = projects.map { project ->
            project.rootNode.children.map { child -> child.name.lowercase() }.toSet()
        }
        return topLevelNodesSets.reduce { acc, set -> acc.intersect(set) }.isNotEmpty()
    }

    private fun printOverlapError(projects: List<Project>) {
        Logger.warn { "Warning: No top-level overlap between projects. Missing first-level nodes:" }
        projects.forEachIndexed { index, project ->
            val firstLevelNodes = project.rootNode.children.take(3).joinToString(", ") { it.name }
            Logger.info { "Project ${index + 1}: $firstLevelNodes" }
        }
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
