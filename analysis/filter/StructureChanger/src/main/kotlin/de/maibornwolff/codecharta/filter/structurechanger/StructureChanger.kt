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

    @CommandLine.Option(arity = "1..*", names = ["-e", "--extractSubproject"], description = ["path to be extracted recursively"])
    private var paths: Array<String> = arrayOf()

    @CommandLine.Option(arity = "1", names = ["-i", "--inspectStructure"], description = ["show first x layers of project hierarchy"])
    private var showStructure: Int = 0

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name of new file"])
    private var projectName: String? = null

    @CommandLine.Option(names = ["-f", "--moveFrom"], description = ["move nodes in source folder..."])
    private var moveFrom: String? = null

    @CommandLine.Option(names = ["-t", "--moveTo"], description = ["... move nodes to destination folder"])
    private var moveTo: String? = null

    private lateinit var srcProject: Project
    private var toMove: List<MutableNode>? = null
    private val logger = KotlinLogging.logger {}

    override fun call(): Void? {

        srcProject = readProject() ?: return null

        when {
            showStructure > 0 -> ProjectStructurePrinter(srcProject).printProjectStructure(showStructure)
        }

        if (paths.size > 0) srcProject = extractSubproject()

        when {
            (moveFrom != null) && (moveTo != null) -> srcProject = move()
            (moveFrom != null) || (moveTo != null) -> logger.warn("In order to move nodes, both source and destination need to be set.")
        }

        val writer = outputFile?.bufferedWriter() ?: System.out.bufferedWriter()
        ProjectSerializer.serializeProject(srcProject, writer)

        return null
    }

    private fun move(): Project {
        return ProjectBuilder(
                projectName ?: srcProject.projectName,
                moveNodes(getPathSegments(moveFrom!!), getPathSegments(moveTo!!), srcProject.rootNode.toMutableNode()),
                extractEdges(),
                copyAttributeTypes(),
                copyBlacklist()
        ).build()
    }

    private fun extractSubproject(): Project {
        val pathSegments = paths.map { it.removePrefix("/").split("/") }
        return ProjectBuilder(
                projectName ?: srcProject.projectName,
                extractNodes(pathSegments, srcProject.rootNode.toMutableNode()),
                extractEdges(),
                copyAttributeTypes(),
                copyBlacklist()
        ).build()
    }

    private fun moveNodes(originPath: List<String>, destinationPath: List<String>, node: MutableNode): List<MutableNode> {
        val newStructure = listOf(removeMovedNodeFromStructure(originPath, node)!!)

        return if (toMove == null) {
            logger.warn("Folder $moveFrom has not been found")
            newStructure
        } else {
            insertInNewStructure(destinationPath.drop(1), node)
            newStructure
        }
    }

    private fun insertInNewStructure(destinationPath: List<String>, node: MutableNode) {
        if (destinationPath.isEmpty()) {
            node.children.addAll(toMove!!)
        } else {
            var chosenChild: MutableNode? = node.children.filter { destinationPath.first() == it.name }.firstOrNull()

            if (chosenChild == null) {
                node.children.add(MutableNode(destinationPath.first(), type = NodeType.Folder))
                chosenChild = node.children.firstOrNull { destinationPath.first() == it.name }
            }
            insertInNewStructure(destinationPath.drop(1), chosenChild!!)
        }
    }

    private fun removeMovedNodeFromStructure(originPath: List<String>, node: MutableNode): MutableNode? {

        return if (originPath.isEmpty() || originPath.first() != node.name) {
            node
        } else if (originPath.size == 1) {
            toMove = node.children
            null
        } else {
            node.children = node.children.mapNotNull { child -> removeMovedNodeFromStructure(originPath.drop(1), child) }.toMutableList()
            node
        }
    }

    private fun getPathSegments(path: String): List<String> {
        return path.removePrefix("/").split("/")
    }

    private fun extractNodes(extractionPattern: List<List<String>>, node: MutableNode): MutableList<MutableNode> {
        val children: List<MutableNode> = node.children
        val extractedNodes: MutableList<MutableNode> = mutableListOf()
        extractionPattern.forEach {
            val currentSearchPattern = it.firstOrNull()
            if (currentSearchPattern == null) {
                extractedNodes.addAll(node.children)
            } else if (currentSearchPattern == node.name) {
                children.forEach { childNode ->
                    extractedNodes.addAll(extractNodes(listOf(it.drop(1)), childNode))
                }
            }
        }
        node.children = extractedNodes
        return mutableListOf(node)
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
