package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node

/** One file's outgoing dependencies, folded up from the declarations the file contains. */
data class AggregatedFileEdge(val from: FilePath, val to: FilePath, val weight: Int, val isCyclic: Boolean)

/**
 * Folds the declaration-level graph onto the files the declarations live in.
 *
 * DependaCharta's leaves are declarations under a logical namespace tree; cc.json addresses nodes by
 * their position in the physical tree. Aggregating here joins the two: a file-to-file edge sums the
 * weights of the declaration edges behind it and is cyclic if any of them is — the rule DependaCharta
 * already applies when a namespace collapses. Edges between two declarations in the same file
 * disappear, since a file cannot depend on itself.
 *
 * A logical path declared in several files (a C# partial class, a Go function name reused in a package, two
 * projects with the same package) is one leaf per file. Each copy's dependencies count for the file they are
 * written in, while a dependency *on* the path points at the file [DeclaringFiles] picks for the using file, the
 * same copy the leaf edge targets. Cycles are found per logical path, so when two copies in different files
 * reference the same cyclic target, both file edges count as cyclic.
 */
object FileLevelAggregator {
    fun aggregate(resolvedNodes: Collection<Node>, cyclicEdgesByDeclaration: Map<String, Set<String>>): List<AggregatedFileEdge> {
        val declaringFiles = DeclaringFiles.of(resolvedNodes)

        val weightByEndpoints = LinkedHashMap<Pair<FilePath, FilePath>, Int>()
        val cyclicEndpoints = HashSet<Pair<FilePath, FilePath>>()

        resolvedNodes.forEach { node ->
            val declarationId = node.pathWithName.withDots()
            val sourceFile = FilePath.of(node)
            val cyclicTargets = cyclicEdgesByDeclaration[declarationId].orEmpty()

            node.resolvedNodeDependencies.internalDependencies.forEach { dependency ->
                val targetId = dependency.withDots()
                // A dependency whose declaration no analyzer produced (e.g. a node dropped as a Rust
                // re-export carrier) has no file to point at, so there is no edge to draw.
                val targetFile = declaringFiles.fileFor(targetId, sourceFile) ?: return@forEach
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
}
