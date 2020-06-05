package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "merge",
    description = ["merges multiple cc.json files"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class MergeFilter : Callable<Void?> {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE or FOLDER", description = ["files to merge"])
    private var sources: Array<File> = arrayOf()

    @CommandLine.Option(names = ["-a", "--add-missing"], description = ["enable adding missing nodes to reference"])
    private var addMissingNodes = false

    @CommandLine.Option(names = ["--recursive"], description = ["recursive merging strategy"])
    private var recursiveStrategySet = true

    @CommandLine.Option(names = ["--leaf"], description = ["leaf merging strategy"])
    private var leafStrategySet = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["--ignore-case"], description = ["ignores case when checking node names"])
    private var ignoreCase = false
    private val logger = KotlinLogging.logger {}
    override fun call(): Void? {
        val nodeMergerStrategy =
            when {
                leafStrategySet -> LeafNodeMergerStrategy(addMissingNodes, ignoreCase)
                recursiveStrategySet && !leafStrategySet -> RecursiveNodeMergerStrategy(ignoreCase)
                else -> throw IllegalArgumentException(
                    "Only one merging strategy must be set"
                )
            }
        val sourceFiles = mutableListOf<File>()
        for (source in sources) {
            sourceFiles.addAll(getFilesInFolder(source))
        }
        val srcProjects = sourceFiles
            .mapNotNull {
                val bufferedReader = it.bufferedReader()
                try {
                    ProjectDeserializer.deserializeProject(bufferedReader)
                } catch (e: Exception) {
                    logger.warn("${it.name} is not a valid project file and is therefore skipped.")
                    null
                }
            }
        val mergedProject = ProjectMerger(srcProjects, nodeMergerStrategy).merge()
        val writer = outputFile?.bufferedWriter() ?: System.out.bufferedWriter()
        ProjectSerializer.serializeProject(mergedProject, writer)

        return null
    }

    private fun getFilesInFolder(folder: File): List<File> {
        val files = folder.walk().filter { !it.name.startsWith(".") && !it.isDirectory }
        return files.toList()
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(MergeFilter(), System.out, *args)
        }

        fun mergePipedWithCurrentProject(pipedProject: Project, currentProject: Project): Project {
            return ProjectMerger(
                listOf(pipedProject, currentProject),
                RecursiveNodeMergerStrategy(false)
            ).merge()
        }
    }
}
