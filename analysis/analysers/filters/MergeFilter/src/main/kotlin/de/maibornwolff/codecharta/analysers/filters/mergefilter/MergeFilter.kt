package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.analysers.filters.mergefilter.Dialog.Companion.askForceMerge
import de.maibornwolff.codecharta.analysers.filters.mergefilter.Dialog.Companion.requestMimoFileSelection
import de.maibornwolff.codecharta.analysers.filters.mergefilter.mimo.Mimo
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.io.PrintStream

@CommandLine.Command(
    name = MergeFilter.NAME,
    description = [MergeFilter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class MergeFilter(
    private val output: PrintStream = System.out
) : AnalyserInterface {
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

    @CommandLine.Option(
        names = ["--large"],
        description = ["Merges input files into on file divided into project sub-folder as defined per prefix of each input file"]
    )
    private var largeMerge = false

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
            else -> throw IllegalArgumentException("At least one merging strategy must be set")
        }

        require(InputHelper.isInputValid(sources, canInputContainFolders = true)) {
            "Input invalid files/folders for MergeFilter, stopping execution..."
        }

        val sourceFiles = InputHelper.getFileListFromValidatedResourceArray(sources)

        if (mimo) {
            processMimoMerge(sourceFiles, nodeMergerStrategy)
        } else if (largeMerge) {
            processLargeMerge(sourceFiles, nodeMergerStrategy)
        } else {
            val projects = readInputFiles(sourceFiles)

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

            val continueMerge = runInTerminalSession { askForceMerge(this) }

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

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }

    private fun processMimoMerge(sourceFiles: List<File>, nodeMergerStrategy: NodeMergerStrategy) {
        val groupedFiles: List<Pair<Boolean, List<File>>> = Mimo.generateProjectGroups(sourceFiles, levenshteinDistance)

        groupedFiles.forEach { (exactMatch, files) ->
            val confirmedFileList = if (exactMatch) {
                files
            } else {
                runInTerminalSession { requestMimoFileSelection(this, files) }
            }
            if (confirmedFileList.size <= 1) {
                Logger.info { "Continue with next group, because one or less files were selected" }
                return@forEach
            }

            val projectsFileNamePairs = readInputFilesKeepFileNames(confirmedFileList)
            val projects = projectsFileNamePairs.map { it.second }
            if (projectsFileNamePairs.size <= 1) {
                Logger.warn { "After deserializing there were one or less projects. Continue with next group" }
                return@forEach
            }

            if (!continueIfIncompatibleProjects(projects)) return@forEach

            val mergedProject = ProjectMerger(projects, nodeMergerStrategy).merge()
            val outputFilePrefix = Mimo.retrieveGroupName(projectsFileNamePairs.map { it.first })
            val outputFileName = "$outputFilePrefix.merge.cc.json"
            val outputFilePath = Mimo.assembleOutputFilePath(outputFile, outputFileName)
            ProjectSerializer.serializeToFileOrStream(mergedProject, outputFilePath, output, compress)
            Logger.info {
                "Merged files with prefix '$outputFilePrefix' into" +
                    " '$outputFileName${if (compress) ".gz" else ""}'"
            }
        }
    }

    private fun processLargeMerge(sourceFiles: List<File>, nodeMergerStrategy: NodeMergerStrategy) {
        val projectsFileNamePairs = readInputFilesKeepFileNames(sourceFiles)
        val fileNameList = projectsFileNamePairs.map { it.first }

        require(fileNameList.size > 1) {
            Logger.warn { "One or less projects in input, merging aborted." }
        }

        require(fileNameList.groupingBy { it.substringBefore(".") }.eachCount().all { it.value == 1 }) {
            Logger.warn { "Make sure that the input prefixes across all input files are unique!" }
        }

        val packagedProjects: MutableList<Project> = mutableListOf()
        projectsFileNamePairs.forEach {
            packagedProjects.add(LargeMerge.wrapProjectInFolder(it.second, it.first.substringBefore(".")))
        }

        val mergedProject = ProjectMerger(packagedProjects, nodeMergerStrategy).merge()
        ProjectSerializer.serializeToFileOrStream(mergedProject, outputFile, output, compress)
    }

    private fun readInputFiles(files: List<File>): List<Project> {
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

    private fun readInputFilesKeepFileNames(files: List<File>): List<Pair<String, Project>> {
        return files.mapNotNull {
            try {
                Pair(it.name, ProjectDeserializer.deserializeProject(it.inputStream()))
            } catch (e: Exception) {
                Logger.warn { "${it.name} is not a valid project file and will be skipped." }
                null
            }
        }
    }
}
