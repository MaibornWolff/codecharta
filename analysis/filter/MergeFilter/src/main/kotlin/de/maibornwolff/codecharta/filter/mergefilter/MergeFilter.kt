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

    @CommandLine.Option(names = ["-a", "--add-missing"], description = ["[Leaf Merging Strategy] enable adding missing nodes to reference"])
    private var addMissingNodes = false

    @CommandLine.Option(names = ["--recursive"], description = ["Recursive Merging Strategy (default)"])
    private var recursiveStrategySet = true

    @CommandLine.Option(names = ["--leaf"], description = ["Leaf Merging Strategy"])
    private var leafStrategySet = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout; ignored in MIMO mode)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    @CommandLine.Option(names = ["--ignore-case"], description = ["ignores case when checking node names"])
    private var ignoreCase = false

    @CommandLine.Option(names = ["-f"], description = ["force merge non-overlapping modules at the top-level structure"])
    private var mergeModules = false

    @CommandLine.Option(names = ["--mimo"], description = ["merge multiple files with the same prefix into multiple output files"])
    private var mimo = false

    @CommandLine.Option(
        names = ["-ld", "--levenshtein-distance"],
        description = ["[MIMO mode] levenshtein distance for name match suggestions (default: 3; 0 for no suggestions)"]
    )
    private var levenshteinDistance = 3

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

        if (mimo) {
            processMimoMerge(sourceFiles, nodeMergerStrategy)
        } else {
            val projects = readProjects(sourceFiles)
            if (!continueIfIncompatibleProjects(projects)) return null

            val mergedProject = ProjectMerger(projects, nodeMergerStrategy).merge()
            ProjectSerializer.serializeToFileOrStream(mergedProject, outputFile, output, compress)
        }

        return null
    }

    private fun continueIfIncompatibleProjects(projects: List<Project>): Boolean {
        if (mergeModules) return true
        if (!hasTopLevelOverlap(projects)) {
            printOverlapError(projects)

            val continueMerge = ParserDialog.askForceMerge()

            if (!continueMerge) {
                Logger.info { "Merge cancelled by the user." }
                return false
            }
        }
        return true
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

    private fun processMimoMerge(sourceFiles: List<File>, nodeMergerStrategy: NodeMergerStrategy) {
        val mutableSourceFiles: MutableList<File> = sourceFiles.toMutableList()
        val groupedFiles: MutableList<Pair<Boolean, List<File>>> = mutableListOf()
        while (mutableSourceFiles.isNotEmpty()) {
            val currentFile = mutableSourceFiles.removeFirst()
            var exactMatch = true
            val currentFileList: MutableList<File> = mutableListOf()

            mutableSourceFiles.forEach {
                val filterResult = mimoGroupFileFilter(currentFile, it)
                if (filterResult == 0) {
                    currentFileList.add(it)
                } else if (filterResult == 1) {
                    exactMatch = false
                    currentFileList.add(it)
                }
            }

            mutableSourceFiles.removeAll(currentFileList)
            currentFileList.add(currentFile)

            if (currentFileList.size > 1) {
                groupedFiles.add(Pair(exactMatch, currentFileList))
            } else {
                Logger.debug { "Discarded ${currentFile.name} as a potential group" }
            }
        }

        groupedFiles.forEach { (exactMatch, files) ->
            val confirmedFileList = if (exactMatch) {
                files
            } else {
                ParserDialog.requestMimoFileSelection(files)
            }
            if (confirmedFileList.size <= 1) {
                Logger.info { "Continue with next group, because one or less files were selected" }
                return@forEach
            }

            val projects = readProjects(confirmedFileList)
            if (projects.size <= 1) {
                Logger.warn { "After deserializing there were one or less projects. Continue with next group" }
                return@forEach
            }

            if (!continueIfIncompatibleProjects(projects)) return@forEach

            val mergedProject = ProjectMerger(projects, nodeMergerStrategy).merge()
            val outputFilePrefix = mimoGroupNameGenerator(confirmedFileList)
            ProjectSerializer.serializeToFileOrStream(mergedProject, "$outputFilePrefix.merge.cc.json", output, compress)
            Logger.info {
                "Merged files with prefix '$outputFilePrefix' into" +
                    " '$outputFilePrefix.merge.cc.json${if (compress) ".gz" else ""}'"
            }
        }
    }

    private fun levenshteinDistance(lhs: CharSequence, rhs: CharSequence): Int {
        val lhsLength = lhs.length
        val rhsLength = rhs.length

        var cost = IntArray(rhsLength + 1) { it }
        var newCost = IntArray(rhsLength + 1)

        for (i in 1..lhsLength) {
            newCost[0] = i

            for (j in 1..rhsLength) {
                val match = if (lhs[i - 1] == rhs[j - 1]) 0 else 1
                val costReplace = cost[j - 1] + match
                val costInsert = cost[j] + 1
                val costDelete = newCost[j - 1] + 1

                newCost[j] = minOf(costInsert, costDelete, costReplace)
            }

            val swap = cost
            cost = newCost
            newCost = swap
        }

        return cost[rhsLength]
    }

    private fun mimoGroupFileFilter(original: File, comparison: File): Int {
        val ogPrefix = original.name.substringBefore(".")
        val compPrefix = comparison.name.substringBefore(".")
        return if (ogPrefix == compPrefix) {
            0
        } else if (levenshteinDistance > 0 && levenshteinDistance(ogPrefix, compPrefix) <= levenshteinDistance) {
            1
        } else {
            -1
        }
    }

    private fun mimoGroupNameGenerator(files: List<File>): String {
        val filePrefixes = files.map { it.name.substringBefore(".") }.toSet()
        if (filePrefixes.size == 1) return filePrefixes.first()
        return ParserDialog.askForMimoPrefix(filePrefixes)
    }

    private fun readProjects(files: List<File>): List<Project> {
        return files.mapNotNull {
            val input = it.inputStream()
            try {
                ProjectDeserializer.deserializeProject(input)
            } catch (e: Exception) {
                Logger.warn { "${it.name} is not a valid project file and will be skipped." }
                null
            }
        }
    }
}
