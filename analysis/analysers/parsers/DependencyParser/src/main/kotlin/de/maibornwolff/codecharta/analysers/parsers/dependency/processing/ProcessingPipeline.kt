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
                    "supported source files were found, or every file failed to parse. Re-run with --verbose=false " +
                    "for per-file details."
            }
            return DependencyGraph()
        }

        val cyclicEdgesByDeclaration = detectCycles(resolvedNodes, omitGraphAnalysis)
        val declarationsById = declarationsById(resolvedNodes)
        val declarationEdges = toDeclarationEdges(resolvedNodes, declarationsById.keys, cyclicEdgesByDeclaration)
        val aggregatedEdges = FileLevelAggregator.aggregate(resolvedNodes, cyclicEdgesByDeclaration)
        val filePaths = resolvedNodes.map { FileLevelAggregator.filePathOf(it) }.distinct()

        if (omitGraphAnalysis) {
            Logger.info { "Levelization disabled by --omit-graph-analysis" }
            return DependencyGraph(
                edges = aggregatedEdges.map { it.withoutLevelization() },
                declarations = declarationsById.values.toList(),
                declarationEdges = declarationEdges
            )
        }

        val physical = levelizeFileTree(aggregatedEdges, filePaths)
        return levelizeNamespaceTree(physical, resolvedNodes, declarationsById.values.toList(), declarationEdges)
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
                isPointingUpwards = pointsUpwards(index, edge.from.graphId, edge.to.graphId)
            )
        }
        return DependencyGraph(edges, collectLevels(levelizedRoots, filePaths))
    }

    /**
     * Levelizes the packages the declarations sit in, using the same three calls the folder tree makes:
     * build the tree, levelize it, index it. The two levelizations are independent — folder levels are
     * not a projection of namespace levels — so both run, which is why `--omit-graph-analysis` skips both.
     */
    private fun levelizeNamespaceTree(
        physical: DependencyGraph,
        resolvedNodes: Collection<Node>,
        declarations: List<Declaration>,
        declarationEdges: List<DeclarationEdge>
    ): DependencyGraph {
        val levelizedRoots = Logger.timed("Leveling the namespace tree") { levelize(resolvedNodes.toGraphNodes()) }
        val (_, unifiedRoot) = GraphNode.wrapInVirtualRootIfNeeded(levelizedRoots)
        val index = GraphIndex(unifiedRoot)
        val levelByGraphId = collectGraphLevels(levelizedRoots)
        val declarationIds = declarations.map { it.id }.toSet()

        return physical.copy(
            declarations = declarations.map { it.copy(level = levelByGraphId[it.id]) },
            declarationEdges =
                declarationEdges.map { it.copy(isPointingUpwards = pointsUpwards(index, it.fromId, it.toId)) },
            namespaceLevels = levelByGraphId.filterKeys { it !in declarationIds }
        )
    }

    // A pair the index cannot relate — a node the levelizer dropped, or two roots with no common ancestor
    // — is not evidence of an architectural violation, so it counts as pointing downwards.
    private fun pointsUpwards(index: GraphIndex, sourceGraphId: String, targetGraphId: String): Boolean = try {
        index.isPointingUpwards(sourceGraphId, targetGraphId)
    } catch (unrelated: IllegalStateException) {
        false
    }

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

    // The namespace tree is addressed by the very ids the logical layer uses, so unlike the folder tree
    // its levels need no translation back into path segments.
    private fun collectGraphLevels(levelizedRoots: List<GraphNode>): Map<String, Int> {
        val levels = LinkedHashMap<String, Int>()

        fun collect(node: GraphNode) {
            node.level?.let { levels[node.id] = it }
            node.children.forEach(::collect)
        }
        levelizedRoots.forEach(::collect)
        return levels
    }

    /**
     * Indexes the declarations by their dotted logical path.
     *
     * Two declarations can resolve to the same path — a partial class split across files, a name a
     * language allows twice. Keeping the last one silently would make the leaf point at an arbitrary
     * file, so the first is kept and the collision reported, the way a duplicate node id is handled on
     * read. The file is the one [FileLevelAggregator] points file edges at, so both projections agree on
     * where a split declaration lives; its leaf edges are the union of every part's dependencies.
     */
    private fun declarationsById(resolvedNodes: Collection<Node>): Map<String, Declaration> {
        val filePathByDeclaration = FileLevelAggregator.firstFilePathByDeclaration(resolvedNodes)
        val declarations = LinkedHashMap<String, Declaration>()
        val duplicateIds = mutableListOf<String>()
        resolvedNodes.forEach { node ->
            val declarationId = node.pathWithName.withDots()
            val declaration =
                Declaration(declarationId, node.name(), node.nodeType.name, filePathByDeclaration.getValue(declarationId).segments)
            if (declarations.putIfAbsent(declarationId, declaration) != null) duplicateIds.add(declarationId)
        }
        if (duplicateIds.isNotEmpty()) {
            Logger.warn {
                "${duplicateIds.size} declaration(s) share a logical path with an earlier one, e.g. " +
                    "'${duplicateIds.first()}'; keeping the first of each."
            }
        }
        return declarations
    }

    /**
     * Folds the resolved declaration dependencies into one edge per ordered pair: the weight counts the
     * individual references, and [DeclarationEdge.usage] collects every way the source uses the target.
     */
    private fun toDeclarationEdges(
        resolvedNodes: Collection<Node>,
        knownDeclarationIds: Set<String>,
        cyclicEdgesByDeclaration: Map<String, Set<String>>
    ): List<DeclarationEdge> {
        val edgesByEndpoints = LinkedHashMap<Pair<String, String>, DeclarationEdge>()
        resolvedNodes.forEach { node ->
            val sourceId = node.pathWithName.withDots()
            val cyclicTargets = cyclicEdgesByDeclaration[sourceId].orEmpty()

            node.resolvedNodeDependencies.internalDependencies.forEach { dependency ->
                val targetId = dependency.withDots()
                // A dependency whose declaration no analyzer produced (e.g. a node dropped as a Rust
                // re-export carrier) has nothing to point at, so there is no edge to draw.
                if (targetId !in knownDeclarationIds || targetId == sourceId) return@forEach
                val edge =
                    DeclarationEdge(
                        fromId = sourceId,
                        toId = targetId,
                        weight = 1,
                        usage = listOf(dependency.type.rawValue),
                        isCyclic = targetId in cyclicTargets,
                        isPointingUpwards = false
                    )
                edgesByEndpoints.merge(sourceId to targetId, edge, ::foldDeclarationEdge)
            }
        }
        return edgesByEndpoints.values.toList()
    }

    private fun foldDeclarationEdge(first: DeclarationEdge, second: DeclarationEdge): DeclarationEdge = first.copy(
        weight = first.weight + second.weight,
        usage = (first.usage + second.usage).distinct(),
        isCyclic = first.isCyclic || second.isCyclic
    )

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

private fun <T> Logger.timed(description: String, block: () -> T): T {
    info { "'$description' started" }
    val startedAt = System.currentTimeMillis()
    val result = block()
    info { "'$description' took ${System.currentTimeMillis() - startedAt}ms" }
    return result
}
