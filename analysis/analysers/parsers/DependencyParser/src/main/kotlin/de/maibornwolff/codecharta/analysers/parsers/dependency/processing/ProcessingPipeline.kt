package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.CycleAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.CycleAnalyzer.Companion.groupByLeafs
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.DependencyResolverService
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.GraphIndex
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.GraphLeaf
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.levelize
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphEdge
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNode
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.toGraphNodes
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.toGraphTree
import de.maibornwolff.codecharta.util.Logger
import java.io.File

// Cycles are detected between declarations, since two classes in one file form a cycle only if they really reference
// each other. The result is then folded onto the files, so every physical level and edge addresses a node of the
// cc.json file tree, and kept per declaration for the logical graph over the namespace tree.
object ProcessingPipeline {
    /** [analysisRoot] is the folder the file paths of the reports are relative to. */
    fun run(fileReports: List<FileReport>, omitGraphAnalysis: Boolean, analysisRoot: File? = null): DependencyGraph {
        val resolvedNodes = resolveDependencies(fileReports)
        if (resolvedNodes.isEmpty()) {
            Logger.warn {
                "No analyzable declarations were found, so the dependency lens stays empty. This usually means no " +
                    "supported source files were found, or every file was skipped; see the warnings above."
            }
            return DependencyGraph()
        }

        val cyclicEdgesByDeclaration = detectCycles(resolvedNodes, omitGraphAnalysis)
        val declaringFiles = DeclaringFiles.of(resolvedNodes, analysisRoot)
        val aggregatedEdges = FileLevelAggregator.aggregate(resolvedNodes, cyclicEdgesByDeclaration, declaringFiles)

        if (omitGraphAnalysis) {
            Logger.info { "Levelization disabled by --omit-graph-analysis" }
            val physical = DependencyGraph(edges = aggregatedEdges.map { it.withoutLevelization() })
            return LogicalProjection(resolvedNodes, cyclicEdgesByDeclaration, namespaceTree = null, declaringFiles).addTo(physical)
        }

        val filePaths = resolvedNodes.map { FilePath.of(it) }.distinct()
        val physical = levelizeFileTree(aggregatedEdges, filePaths)
        return LogicalProjection(
            resolvedNodes,
            cyclicEdgesByDeclaration,
            levelizeNamespaceTree(resolvedNodes),
            declaringFiles
        ).addTo(physical)
    }

    private fun levelizeFileTree(aggregatedEdges: List<AggregatedFileEdge>, filePaths: List<FilePath>): DependencyGraph {
        val levelizedRoots = Logger.timed("Leveling the folder tree") { levelize(toFileTree(aggregatedEdges, filePaths)) }
        val (_, unifiedRoot) = GraphNode.wrapInVirtualRootIfNeeded(levelizedRoots)
        val index = GraphIndex(unifiedRoot)

        val edges = aggregatedEdges.map { edge ->
            FileDependencyEdge(
                fromPath = edge.from.segments,
                toPath = edge.to.segments,
                weight = edge.weight,
                isCyclic = edge.isCyclic,
                isPointingUpwards = index.pointsUpwardsOrFalse(edge.from.graphId, edge.to.graphId)
            )
        }
        return DependencyGraph(edges, collectLevels(levelizedRoots, filePaths))
    }

    // Folder levels are not a projection of namespace levels, so both levelizations run
    private fun levelizeNamespaceTree(resolvedNodes: Collection<Node>): LevelizedNamespaceTree =
        LevelizedNamespaceTree(Logger.timed("Leveling the namespace tree") { levelize(resolvedNodes.toGraphNodes()) })

    private fun toFileTree(aggregatedEdges: List<AggregatedFileEdge>, filePaths: List<FilePath>): List<GraphNode> {
        val edgesByFile = aggregatedEdges.groupBy { it.from }
        return filePaths
            .map { filePath ->
                GraphLeaf(
                    path = filePath.escapedPath,
                    edges = edgesByFile[filePath]
                        .orEmpty()
                        .map { GraphEdge(filePath.graphId, it.to.graphId, it.weight, DEPENDENCY_EDGE_TYPE) }
                        .toSet()
                )
            }.toGraphTree()
    }

    // The graph ids escape the dots inside a segment, which cannot be reversed since a name may contain underscores
    // of its own, so the true segments come from the file paths that built the tree
    private fun collectLevels(levelizedRoots: List<GraphNode>, filePaths: List<FilePath>): List<LevelizedPath> {
        val segmentsByGraphId = HashMap<String, List<String>>()
        filePaths.forEach { filePath ->
            filePath.segments.indices.forEach { depth ->
                val prefix = filePath.segments.take(depth + 1)
                segmentsByGraphId[Path(prefix).withDots()] = prefix
            }
        }
        val fileGraphIds = filePaths.map { it.graphId }.toSet()

        val levels = mutableListOf<LevelizedPath>()

        fun collect(node: GraphNode) {
            val segments = segmentsByGraphId[node.id]
            val level = node.level
            if (segments != null && level != null) {
                levels.add(LevelizedPath(segments, node.id in fileGraphIds, level))
            }
            node.children.forEach(::collect)
        }
        levelizedRoots.forEach(::collect)
        return levels
    }

    private fun detectCycles(resolvedNodes: Collection<Node>, omitGraphAnalysis: Boolean): Map<String, Set<String>> {
        if (omitGraphAnalysis) {
            Logger.info { "Cycle detection disabled by --omit-graph-analysis" }
            return emptyMap()
        }
        return Logger.timed("Analyzing cycles") {
            val nodeInfos = resolvedNodes.map { DependencyResolverService.mapNodeInfo(it) }.toSet()
            val cycles = CycleAnalyzer.determineCycles(nodeInfos)
            Logger.info { "Found a total of ${cycles.size} cycles" }
            cycles.groupByLeafs()
        }
    }

    private fun resolveDependencies(fileReports: List<FileReport>): Collection<Node> =
        Logger.timed("Resolving dependencies") { DependencyResolverService.resolveNodes(fileReports) }

    private fun AggregatedFileEdge.withoutLevelization(): FileDependencyEdge =
        FileDependencyEdge(from.segments, to.segments, weight, isCyclic, isPointingUpwards = false)

    private const val DEPENDENCY_EDGE_TYPE = "usage"
}

// A pair the index cannot relate — a node the levelizer dropped, or two roots with no common ancestor — is
// not evidence of an architectural violation, so it counts as pointing downwards.
internal fun GraphIndex.pointsUpwardsOrFalse(sourceGraphId: String, targetGraphId: String): Boolean = try {
    isPointingUpwards(sourceGraphId, targetGraphId)
} catch (unrelated: IllegalStateException) {
    false
}

private fun <T> Logger.timed(description: String, block: () -> T): T {
    info { "'$description' started" }
    val startedAt = System.currentTimeMillis()
    val result = block()
    info { "'$description' took ${System.currentTimeMillis() - startedAt}ms" }
    return result
}
