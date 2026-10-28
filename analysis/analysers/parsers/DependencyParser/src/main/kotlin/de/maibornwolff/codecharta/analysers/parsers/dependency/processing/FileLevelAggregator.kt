package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
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
 * written in, while a dependency *on* the path points at the files [DeclaringFiles] picks for the using file, the
 * same copies the leaf edges target, and [DeclarationCycles] tells per copy whether it lies on a cycle.
 */
object FileLevelAggregator {
    internal fun aggregate(
        resolvedNodes: Collection<Node>,
        cycles: DeclarationCycles = DeclarationCycles.NONE,
        declaringFiles: DeclaringFiles = DeclaringFiles.of(resolvedNodes)
    ): List<AggregatedFileEdge> {
        val weightByEndpoints = LinkedHashMap<Pair<FilePath, FilePath>, Int>()
        val cyclicEndpoints = HashSet<Pair<FilePath, FilePath>>()

        resolvedNodes.forEach { node ->
            val source = DeclarationKey.of(node)
            val sourceFile = source.file

            node.resolvedNodeDependencies.internalDependencies.forEach { dependency ->
                val targetId = dependency.withDots()
                // A dependency whose declaration no analyzer produced (e.g. a node dropped as a Rust
                // re-export carrier) has no file to point at, so there is no edge to draw.
                val targetFiles = declaringFiles.filesFor(targetId, sourceFile, node.language, dependency.kinds)
                targetFiles.filter { it != sourceFile }.forEach { targetFile ->
                    val endpoints = sourceFile to targetFile
                    weightByEndpoints.merge(endpoints, 1, Int::plus)
                    if (cycles.isCyclic(source, DeclarationKey(targetFile, targetId))) cyclicEndpoints.add(endpoints)
                }
            }
        }

        return weightByEndpoints.map { (endpoints, weight) ->
            AggregatedFileEdge(endpoints.first, endpoints.second, weight, endpoints in cyclicEndpoints)
        }
    }
}
