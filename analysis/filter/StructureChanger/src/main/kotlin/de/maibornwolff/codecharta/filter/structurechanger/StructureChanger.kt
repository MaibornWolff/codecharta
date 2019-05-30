package de.maibornwolff.codecharta.filter.structurechanger

import de.maibornwolff.codecharta.model.*
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import mu.KotlinLogging
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(name = "structurechanger",
        description = ["changes the structure of cc.json files"],
        footer = ["Copyright(c) 2019, MaibornWolff GmbH"])
class StructureChanger : Callable<Void?> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["input project file"])
    private var source: File = File("")

    @CommandLine.Option(arity = "1..*", names = ["-p", "--path"], description = ["path to be extracted recursively"])
    private var paths: Array<String> = arrayOf()

    @CommandLine.Option(arity = "1..*", names = ["-s", "--showStructure"], description = ["show first x layers of project hierarchy"])
    private var showStructure: Boolean = false

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name of new file"])
    private var projectName: String? = null

    private lateinit var srcProject: Project
    private val logger = KotlinLogging.logger {}

    override fun call(): Void? {

        srcProject = readProject() ?: return null

        val pathSegments = paths.map { it.removePrefix("/").split("/") }
        val extractedProject = ProjectBuilder(
                projectName ?: srcProject.projectName,
                extractNodes(pathSegments, srcProject.rootNode.toMutableNode()),
                extractEdges(),
                copyAttributeTypes(),
                copyBlacklist()
        ).build()

        val writer = outputFile?.bufferedWriter() ?: System.out.bufferedWriter()
        ProjectSerializer.serializeProject(extractedProject, writer)

        return null
    }

    private fun extractNodes(extractionPattern: List<List<String>>, node: MutableNode): MutableList<MutableNode> {
        val children: List<MutableNode> = node.children
        val extractedNodes: MutableList<MutableNode> = mutableListOf()
        extractionPattern.forEach {
            if (node.name == it.first()) {
                (extractedNodes + node)
                children.forEach { childNode ->
                    extractedNodes.union(extractNodes(listOf(it.drop(1)), childNode))
                }
            }
        }
        return extractedNodes
    }

    private fun extractEdges(): MutableList<Edge> {
        return if (srcProject.edges.size == 0) mutableListOf()
        else {
            logger.warn("${srcProject.edges.size} edges were discarded because the node extractor does not support extracting edges yet")
            mutableListOf()
        }
    }

    private fun copyAttributeTypes(): MutableMap<String, MutableList<Map<String, AttributeType>>> {
        val mergedAttributeTypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf()
        srcProject.attributeTypes.forEach {
            val key: String = it.key
            if (mergedAttributeTypes.containsKey(key)) {
                it.value.forEach {
                    if (!mergedAttributeTypes[key]!!.contains(it)) {
                        mergedAttributeTypes[key]!!.add(it)
                    }
                }
            } else {
                mergedAttributeTypes[key] = it.value.toMutableList()
            }
        }
        return mergedAttributeTypes
    }

    private fun copyBlacklist(): MutableList<BlacklistItem> {
        return srcProject.blacklist.toMutableList()
    }

    private fun readProject(): Project? {
        val bufferedReader = source.bufferedReader()
        return try {
            ProjectDeserializer.deserializeProject(bufferedReader)
        } catch (e: Exception) {
            logger.warn("${source.name} is not a valid project file and is therefore skipped.")
            null
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(StructureChanger(), System.out, *args)
        }
    }
}
