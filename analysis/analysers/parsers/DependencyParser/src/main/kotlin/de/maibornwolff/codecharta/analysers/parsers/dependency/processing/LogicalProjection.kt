package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.GraphIndex
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.levelization.model.GraphNode
import de.maibornwolff.codecharta.model.withAncestors

internal class LogicalProjection(
    private val resolvedNodes: Collection<Node>,
    private val cyclicEdgesByDeclaration: Map<String, Set<String>>,
    private val namespaceTree: LevelizedNamespaceTree?
) {
    private val firstFileByLogicalPath = FileLevelAggregator.firstFilePathByDeclaration(resolvedNodes)
    private val keyByFileAndLogicalPath = uniqueKeysPerFile()

    fun addTo(physical: DependencyGraph): DependencyGraph {
        val declarations = declarations()
        return physical.copy(
            declarations = declarations,
            declarationEdges = declarationEdges(),
            namespaces = inhabitedNamespaces(declarations)
        )
    }

    // A name is the key unless two declarations of one file share it. Those fall back to their logical
    // path, which no name can equal: a name has its dots escaped.
    private fun uniqueKeysPerFile(): Map<Pair<FilePath, String>, String> = resolvedNodes
        .groupBy { FileLevelAggregator.filePathOf(it) }
        .flatMap { (filePath, nodesOfFile) ->
            nodesOfFile
                .groupBy({ it.name() }, { it.pathWithName.withDots() })
                .flatMap { (name, logicalPaths) ->
                    val distinctPaths = logicalPaths.distinct()
                    distinctPaths.map { logicalPath -> (filePath to logicalPath) to if (distinctPaths.size == 1) name else logicalPath }
                }
        }.toMap()

    private fun addressOf(filePath: FilePath, logicalPath: String): DeclarationAddress =
        DeclarationAddress(filePath.segments, keyByFileAndLogicalPath.getValue(filePath to logicalPath))

    private fun declarations(): List<Declaration> = resolvedNodes
        .map { node ->
            val logicalPath = node.pathWithName.withDots()
            Declaration(
                address = addressOf(FileLevelAggregator.filePathOf(node), logicalPath),
                name = node.name(),
                kind = node.nodeType.name.lowercase(),
                language = node.language.lensName,
                namespace = namespaceOf(node),
                level = namespaceTree?.levelOfDeclaration(logicalPath)
            )
        }.distinctBy { it.address }

    private fun namespaceOf(node: Node): String? {
        if (namespaceTree == null || !node.language.declaresPackages) return null
        val filePath = FileLevelAggregator.filePathOf(node)
        val packageParts =
            node.pathWithName.withoutName().dropTrailingWhile { enclosingDeclaration -> isDeclaredIn(filePath, enclosingDeclaration) }
        if (packageParts == filePath.escapedPath.parts) return null
        return Path(packageParts).withDots().takeIf { it in namespaceTree.namespaces }
    }

    private fun isDeclaredIn(filePath: FilePath, logicalPathParts: List<String>): Boolean =
        (filePath to Path(logicalPathParts).withDots()) in keyByFileAndLogicalPath

    private fun declarationEdges(): List<DeclarationEdge> {
        val edgesByEndpoints = LinkedHashMap<Pair<DeclarationAddress, DeclarationAddress>, DeclarationEdge>()
        resolvedNodes.forEach { node ->
            node.resolvedNodeDependencies.internalDependencies
                .mapNotNull { dependency -> edgeBetween(node, dependency) }
                .forEach { edge -> edgesByEndpoints.merge(edge.from to edge.to, edge, ::fold) }
        }
        return edgesByEndpoints.values.toList()
    }

    // A used type is identified by its name, so a pair arrives once per node and weighs 1 as in
    // DependaCharta. A dependency whose declaration no analyzer produced (e.g. a node dropped as a Rust
    // re-export carrier) has nothing to point at, and a target declared in several files is the first of
    // them, the file [FileLevelAggregator] points the file edge at.
    private fun edgeBetween(node: Node, dependency: Dependency): DeclarationEdge? {
        val sourcePath = node.pathWithName.withDots()
        val targetPath = dependency.withDots()
        val targetFile = firstFileByLogicalPath[targetPath]
        if (targetFile == null || targetPath == sourcePath) return null
        return DeclarationEdge(
            from = addressOf(FileLevelAggregator.filePathOf(node), sourcePath),
            to = addressOf(targetFile, targetPath),
            weight = 1,
            usage = listOf(dependency.type.rawValue),
            isCyclic = targetPath in cyclicEdgesByDeclaration[sourcePath].orEmpty(),
            isPointingUpwards = namespaceTree?.pointsUpwards(sourcePath, targetPath) == true
        )
    }

    private fun fold(first: DeclarationEdge, second: DeclarationEdge): DeclarationEdge = first.copy(
        weight = first.weight + second.weight,
        usage = (first.usage + second.usage).distinct(),
        isCyclic = first.isCyclic || second.isCyclic
    )

    private fun inhabitedNamespaces(declarations: List<Declaration>): Map<String, LevelizedNamespace> {
        val allNamespaces = namespaceTree?.namespaces ?: return emptyMap()
        val inhabited = withAncestors(declarations.mapNotNull { it.namespace }) { allNamespaces[it]?.parent }
        return allNamespaces.filterKeys { it in inhabited }
    }
}

/** A namespace and a declaration can share an id — a class with nested declarations is both — so their levels are kept apart. */
internal class LevelizedNamespaceTree(levelizedRoots: List<GraphNode>) {
    private val index = GraphIndex(GraphNode.wrapInVirtualRootIfNeeded(levelizedRoots).second)
    private val declarationLevels = HashMap<String, Int>()
    private val collectedNamespaces = LinkedHashMap<String, LevelizedNamespace>()

    val namespaces: Map<String, LevelizedNamespace> get() = collectedNamespaces

    init {
        levelizedRoots.forEach { collect(it, parentNamespace = null) }
    }

    private fun collect(node: GraphNode, parentNamespace: String?) {
        val level = node.level ?: return
        if (node.children.isEmpty()) {
            declarationLevels[node.id] = level
            return
        }
        collectedNamespaces[node.id] = LevelizedNamespace(level, parentNamespace)
        node.children.forEach { collect(it, node.id) }
    }

    fun levelOfDeclaration(logicalPath: String): Int? = declarationLevels[logicalPath]

    fun pointsUpwards(sourcePath: String, targetPath: String): Boolean = index.pointsUpwardsOrFalse(sourcePath, targetPath)
}

private fun List<String>.dropTrailingWhile(isDropped: (List<String>) -> Boolean): List<String> {
    var remaining = this
    while (remaining.isNotEmpty() && isDropped(remaining)) {
        remaining = remaining.dropLast(1)
    }
    return remaining
}
