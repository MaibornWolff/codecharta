package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path

/** One file's outgoing dependencies, folded up from the declarations the file contains. */
data class AggregatedFileEdge(val from: FilePath, val to: FilePath, val weight: Int, val isCyclic: Boolean)

/**
 * A source file, in both the form the graph addresses it by ([escapedPath], whose segments have their
 * dots escaped so a graph id splits cleanly) and the form the file tree uses ([segments]).
 */
data class FilePath(val segments: List<String>) {
    val escapedPath: Path = Path(segments)
    val graphId: String = escapedPath.withDots()
}

/**
 * Folds the declaration-level graph onto the files the declarations live in.
 *
 * DependaCharta's leaves are declarations under a logical namespace tree; cc.json addresses nodes by
 * their position in the physical tree. Aggregating here joins the two: a file-to-file edge sums the
 * weights of the declaration edges behind it and is cyclic if any of them is — the rule DependaCharta
 * already applies when a namespace collapses. Edges between two declarations in the same file
 * disappear, since a file cannot depend on itself.
 *
 * A declaration split across files (a C# partial class, a Go function name reused in a package) is one
 * logical leaf but several nodes. Each node's dependencies count for the file they are written in, while
 * a dependency *on* the split declaration points at the file [firstFilePathByDeclaration] reports — the
 * same one the logical layer joins the leaf to.
 */
object FileLevelAggregator {
    fun aggregate(resolvedNodes: Collection<Node>, cyclicEdgesByDeclaration: Map<String, Set<String>>): List<AggregatedFileEdge> {
        val filePathByDeclaration = firstFilePathByDeclaration(resolvedNodes)

        val weightByEndpoints = LinkedHashMap<Pair<FilePath, FilePath>, Int>()
        val cyclicEndpoints = HashSet<Pair<FilePath, FilePath>>()

        resolvedNodes.forEach { node ->
            val declarationId = node.pathWithName.withDots()
            val sourceFile = filePathOf(node)
            val cyclicTargets = cyclicEdgesByDeclaration[declarationId].orEmpty()

            node.resolvedNodeDependencies.internalDependencies.forEach { dependency ->
                val targetId = dependency.withDots()
                // A dependency whose declaration no analyzer produced (e.g. a node dropped as a Rust
                // re-export carrier) has no file to point at, so there is no edge to draw.
                val targetFile = filePathByDeclaration[targetId] ?: return@forEach
                if (targetFile == sourceFile) return@forEach

                val endpoints = sourceFile to targetFile
                weightByEndpoints.merge(endpoints, 1, Int::plus)
                if (targetId in cyclicTargets) cyclicEndpoints.add(endpoints)
            }
        }

        return weightByEndpoints.map { (endpoints, weight) ->
            AggregatedFileEdge(endpoints.first, endpoints.second, weight, endpoints in cyclicEndpoints)
        }
    }

    /** The file each logical path is joined to: the first declaration's, in the order the nodes arrive. */
    fun firstFilePathByDeclaration(resolvedNodes: Collection<Node>): Map<String, FilePath> {
        val filePathByDeclaration = LinkedHashMap<String, FilePath>()
        resolvedNodes.forEach { node -> filePathByDeclaration.putIfAbsent(node.pathWithName.withDots(), filePathOf(node)) }
        return filePathByDeclaration
    }

    private const val CURRENT_DIRECTORY = "."

    fun filePathOf(node: Node): FilePath = FilePath(splitNameToParts(node.physicalPath).filter { it != CURRENT_DIRECTORY })
}
