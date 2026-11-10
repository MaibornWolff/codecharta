package de.maibornwolff.codecharta.analysers.parsers.dependency.output

import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.Declaration
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.DeclarationAddress
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.DependencyGraph
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.TestLinks
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.model.DependencyLeaf
import de.maibornwolff.codecharta.model.DependencyNamespace
import de.maibornwolff.codecharta.model.DependencyNode
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LeafEdge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

/**
 * Writes both projections of the dependency graph into one project: the files as the tree, the
 * file-level dependencies and the declaration-level ones as the dependency lens, and the per-file link
 * counts as ordinary metrics. [TestLinks], from a run that links tests, add the test files with the `test_file` metric
 * and the "Tests" clustering.
 */
class DependencyProjectGenerator(private val projectBuilder: ProjectBuilder = ProjectBuilder()) {
    fun generate(
        graph: DependencyGraph,
        analysedFilePaths: List<List<String>>,
        pipedProject: Project? = null,
        testLinks: TestLinks? = null
    ): Project {
        insertFileNodes(graph, analysedFilePaths, testLinks)
        graph.edges.forEach { edge ->
            projectBuilder.insertEdge(
                Edge(
                    fromNodeName = NodeId.endpointFromSegments(edge.fromPath),
                    toNodeName = NodeId.endpointFromSegments(edge.toPath),
                    attributes = mapOf(DEPENDENCIES to edge.weight),
                    isCyclic = edge.isCyclic,
                    isPointingUpwards = edge.isPointingUpwards
                )
            )
        }

        val project =
            projectBuilder
                .addAttributeTypes(AttributeTypes(mutableMapOf(DEPENDENCIES to AttributeType.ABSOLUTE), EDGE_ATTRIBUTE_TYPE))
                .addAttributeTypes(
                    AttributeTypes(
                        mutableMapOf(
                            OUTGOING_DEPENDENCIES to AttributeType.ABSOLUTE,
                            INCOMING_DEPENDENCIES to AttributeType.ABSOLUTE
                        ),
                        NODE_ATTRIBUTE_TYPE
                    )
                ).withTestLinks(testLinks)
                .addAttributeDescriptions(dependencyAttributeDescriptors() + testFileDescriptorsOf(testLinks))
                .withDependencyLens(
                    nodes = toDependencyNodes(graph),
                    namespaces = graph.namespaces.mapValues { (_, namespace) -> DependencyNamespace(namespace.level, namespace.parent) },
                    leaves = toDependencyLeaves(graph),
                    leafEdges = toLeafEdges(graph)
                ).build()

        return if (pipedProject != null) MergeFilter.mergePipedWithCurrentProject(pipedProject, project) else project
    }

    // A run that links tests judged every file it read, so the code files carry a 0; the test files carry no link counts
    private fun insertFileNodes(graph: DependencyGraph, analysedFilePaths: List<List<String>>, testLinks: TestLinks?) {
        val linkCounts = countLinksPerFile(graph, analysedFilePaths)
        val codeFileAttributes = if (testLinks == null) emptyMap() else mapOf(TEST_FILE to NOT_A_TEST)
        analysedFilePaths.forEach { segments -> insertFileNode(segments, linkCounts.getValue(segments) + codeFileAttributes) }
        testLinks?.testFiles?.forEach { testFile -> insertFileNode(testFile.segments, mapOf(TEST_FILE to IS_A_TEST)) }
    }

    private fun ProjectBuilder.withTestLinks(testLinks: TestLinks?): ProjectBuilder {
        if (testLinks == null) return this
        return addAttributeTypes(AttributeTypes(mutableMapOf(TEST_FILE to AttributeType.ABSOLUTE), NODE_ATTRIBUTE_TYPE))
            .withClustersLens(TestsClustering.of(testLinks))
    }

    private fun testFileDescriptorsOf(testLinks: TestLinks?) = if (testLinks == null) emptyMap() else testFileAttributeDescriptors()

    private fun insertFileNode(segments: List<String>, attributes: Map<String, Any>) {
        if (segments.isEmpty()) return
        projectBuilder.insertByPath(Path(segments.dropLast(1)), MutableNode(segments.last(), NodeType.File, attributes))
    }

    /**
     * Outgoing and incoming counts are metrics about a file, not lens structure, so they go on the node
     * itself. Both sum the weights of the edges leaving and entering the file, i.e. the number of
     * declaration-level dependencies behind them.
     */
    private fun countLinksPerFile(graph: DependencyGraph, analysedFilePaths: List<List<String>>): Map<List<String>, Map<String, Any>> {
        val outgoing = HashMap<List<String>, Int>()
        val incoming = HashMap<List<String>, Int>()
        graph.edges.forEach { edge ->
            outgoing.merge(edge.fromPath, edge.weight, Int::plus)
            incoming.merge(edge.toPath, edge.weight, Int::plus)
        }
        // Every analysed file carries both counts, zero included, so the metric is defined across the
        // whole map rather than only where a dependency happens to exist.
        return analysedFilePaths.associateWith { path ->
            mapOf(
                OUTGOING_DEPENDENCIES to (outgoing[path] ?: 0),
                INCOMING_DEPENDENCIES to (incoming[path] ?: 0)
            )
        }
    }

    private fun toDependencyNodes(graph: DependencyGraph): Map<String, DependencyNode> = graph.levels.associate { levelizedPath ->
        val type = if (levelizedPath.isFile) NodeType.File else NodeType.Folder
        NodeId.fromSegments(levelizedPath.path, type) to DependencyNode(levelizedPath.level)
    }

    private fun toDependencyLeaves(graph: DependencyGraph): Map<String, Map<String, DependencyLeaf>> = graph.declarations
        .groupBy { fileNodeId(it.address) }
        .mapValues { (_, declarationsOfFile) -> declarationsOfFile.associate { it.address.key to it.toLeaf() } }

    private fun Declaration.toLeaf(): DependencyLeaf = DependencyLeaf(
        kind = kind,
        name = name.takeIf { it != address.key },
        language = language,
        namespace = namespace,
        level = level
    )

    private fun toLeafEdges(graph: DependencyGraph): List<LeafEdge> = graph.declarationEdges.map {
        LeafEdge(
            fromId = fileNodeId(it.from),
            fromLeaf = it.from.key,
            toId = fileNodeId(it.to),
            toLeaf = it.to.key,
            attributes = mapOf(DEPENDENCIES to it.weight),
            usage = it.usage,
            isCyclic = it.isCyclic,
            isPointingUpwards = it.isPointingUpwards
        )
    }

    private fun fileNodeId(address: DeclarationAddress): String = NodeId.fromSegments(address.filePath, NodeType.File)

    companion object {
        private const val NODE_ATTRIBUTE_TYPE = "nodes"
        private const val EDGE_ATTRIBUTE_TYPE = "edges"
        private const val IS_A_TEST = 1
        private const val NOT_A_TEST = 0
    }
}
