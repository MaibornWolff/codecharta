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

    @CommandLine.Option(names = ["-mimo"], description = ["merge multiple files with the same prefix into multiple output files"])
    private var mimo = false

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
        }

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

    private fun processMimoMerge(sourceFiles: List<File>, nodeMergerStrategy: NodeMergerStrategy) {
        val groupedFiles = sourceFiles.groupBy { it.name.substringBefore('.') }

        groupedFiles.forEach { (prefix, files) ->
            if (files.size > 1) {
                val rootChildrenNodes = files.mapNotNull {
                    val input = it.inputStream()
                    try {
                        ProjectDeserializer.deserializeProject(input)
                    } catch (e: Exception) {
                        Logger.warn { "${it.name} is not a valid project file and will be skipped." }
                        null
                    }
                }

                if (!mergeModules && !hasTopLevelOverlap(rootChildrenNodes)) {
                    Logger.warn { "Warning: No top-level overlap for files with prefix $prefix." }
                    return@forEach
                }

                val mergedProject = ProjectMerger(rootChildrenNodes, nodeMergerStrategy).merge()
                val outputFileName = "$prefix.merge.cc.json"
                ProjectSerializer.serializeToFileOrStream(mergedProject, outputFileName, output, compress)

                Logger.info { "Merged files with prefix $prefix into $outputFileName" }
            } else {
                Logger.warn { "No matching files found for prefix $prefix." }
                val availablePrefixes = groupedFiles.keys
                suggestAndHandleLevenshteinCorrections(sourceFiles, prefix, availablePrefixes, nodeMergerStrategy)
            }
        }
    }

    private fun suggestAndHandleLevenshteinCorrections(
        sourceFiles: List<File>,
        prefix: String,
        availablePrefixes: Set<String>,
        nodeMergerStrategy: NodeMergerStrategy
    ) {
        val groupedFiles = sourceFiles.groupBy { it.name.substringBefore('.') }

        val suggestions = availablePrefixes
            .filter { it != prefix && levenshteinDistance(it, prefix) < 3 }

        if (suggestions.isNotEmpty()) {
            val selectedPrefix = ParserDialog.askForFileCorrection(prefix, suggestions)

            if (!selectedPrefix.isNullOrBlank()) {
                if (suggestions.contains(selectedPrefix)) {
                    Logger.info { "Merging $prefix with other '$selectedPrefix' projects." }
                    val correctedFiles = (groupedFiles[selectedPrefix] ?: emptyList()) + (groupedFiles[prefix] ?: emptyList())

                    if (correctedFiles.isNotEmpty()) {
                        val rootChildrenNodes = correctedFiles.mapNotNull { file ->
                            val input = file.inputStream()
                            try {
                                ProjectDeserializer.deserializeProject(input)
                            } catch (e: Exception) {
                                Logger.warn { "${file.name} is not a valid project file and will be skipped." }
                                null
                            }
                        }

                        if (!mergeModules && !hasTopLevelOverlap(rootChildrenNodes)) {
                            Logger.warn { "Warning: No top-level overlap for files with prefix $selectedPrefix." }
                            return
                        }

                        val mergedProject = ProjectMerger(rootChildrenNodes, nodeMergerStrategy).merge()
                        val outputFileName = "$selectedPrefix.merge.cc.json"
                        ProjectSerializer.serializeToFileOrStream(mergedProject, outputFileName, output, compress)
                    }
                } else {
                    Logger.warn {
                        "The entered project name '$selectedPrefix' is not a valid suggestion. " +
                            "Please enter a valid project name from the list."
                    }
                    suggestAndHandleLevenshteinCorrections(
                        sourceFiles,
                        prefix,
                        availablePrefixes,
                        nodeMergerStrategy
                    )
                }
            } else {
                Logger.info { "Skipped correction for $prefix." }
            }
        } else {
            Logger.warn { "No matching files found for prefix $prefix, and no close suggestions were found." }
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
}
