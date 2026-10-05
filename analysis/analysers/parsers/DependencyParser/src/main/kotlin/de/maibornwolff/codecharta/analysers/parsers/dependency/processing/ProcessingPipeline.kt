package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
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

/**
 * Turns per-file extraction results into both projections of one dependency graph.
 *
 * Type resolution and cycle detection run at declaration level, where they are meaningful — two classes
 * in one file form a cycle only if they genuinely reference each other. That result is emitted twice:
 * once as the logical graph the code declares, levelized over the namespace tree, and once folded onto
 * the files the declarations live in and levelized over the physical folder tree, so every level and
 * every edge of the physical half addresses a node the cc.json file tree already has.
 */
object ProcessingPipeline {
    fun run(fileReports: List<FileReport>, omitGraphAnalysis: Boolean): DependencyGraph {
        val resolvedNodes = resolveDependencies(mergeIdenticalTypes(fileReports))
        if (resolvedNodes.isEmpty()) {
            Logger.warn {
                "No analyzable declarations were found, so the dependency lens stays empty. This usually means no " +
                    "supported source files were found, or every file was skipped; see the warnings above."
            }
            return DependencyGraph()
        }

        val cyclicEdgesByDeclaration = detectCycles(resolvedNodes, omitGraphAnalysis)
        val aggregatedEdges = FileLevelAggregator.aggregate(resolvedNodes, cyclicEdgesByDeclaration)

        if (omitGraphAnalysis) {
            Logger.info { "Levelization disabled by --omit-graph-analysis" }
            val physical = DependencyGraph(edges = aggregatedEdges.map { it.withoutLevelization() })
            return LogicalProjection(resolvedNodes, cyclicEdgesByDeclaration, namespaceTree = null).addTo(physical)
        }

        val filePaths = resolvedNodes.map { FileLevelAggregator.filePathOf(it) }.distinct()
        val physical = levelizeFileTree(aggregatedEdges, filePaths)
        return LogicalProjection(resolvedNodes, cyclicEdgesByDeclaration, levelizeNamespaceTree(resolvedNodes)).addTo(physical)
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

    /**
     * Levelizes the packages the declarations sit in, as the folder tree is levelized. The two
     * levelizations are independent — folder levels are not a projection of namespace levels — so both
     * run, which is why `--omit-graph-analysis` skips both.
     */
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

    /**
     * Reads a level off every node of the levelized tree and pairs it with the unescaped path the node
     * stands for. The graph escapes dots inside a segment so its dot-joined ids split cleanly, and that
     * escaping is not reversible (a name may contain underscores of its own), so the true segments are
     * recovered from the file paths that built the tree rather than from the ids.
     */
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

    /**
     * C++ declares a type in a header and defines it in a source file, so the same type arrives twice —
     * once per translation unit. Both halves are folded into one node so the type does not appear to
     * depend on itself across the two files.
     */
    private fun mergeIdenticalTypes(fileReports: List<FileReport>): List<FileReport> {
        val nodes = fileReports.flatMap { it.nodes }
        val (mergeable, rest) = nodes.partition { it.language == SupportedLanguage.CPP }
        val (duplicates, singles) = mergeable.groupBy { it.pathWithName }.entries.partition { it.value.size > 1 }
        if (duplicates.isEmpty()) return fileReports
        return listOf(FileReport(singles.flatMap { it.value } + mergeDuplicates(duplicates) + rest))
    }

    private fun mergeDuplicates(duplicates: List<Map.Entry<Path, List<Node>>>): List<Node> = duplicates.flatMap { duplicate ->
        val byName = duplicate.value.groupBy { it.pathWithName.getName() }
        val (sameName, differentNames) = byName.entries.partition { it.value.size > 1 }
        // Sorted so the surviving node's file is the same on every run, whatever order the scan found
        // the header and the source in.
        val merged = sameName.flatMap { it.value }.sortedBy { it.physicalPath }.reduce { first, second ->
            first.copy(
                dependencies = first.dependencies + second.dependencies,
                usedTypes = first.usedTypes + second.usedTypes,
                resolvedNodeDependencies = first.resolvedNodeDependencies + second.resolvedNodeDependencies
            )
        }
        differentNames.flatMap { it.value } + merged
    }

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
