package de.maibornwolff.codecharta.analysers.importers.dependacharta

import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

object DcJsonParser {
    private const val ROOT_PREFIX = "/root/"
    private const val PATH_SEPARATOR = "/"

    /**
     * One [MutableNode] per unique leaf `physicalPath`, paired with the folder [Path] to insert it
     * under. DependaCharta describes symbols (classes/functions) but the code map is file-level, and
     * several symbols can share one file, so paths are de-duplicated. Building these nodes lets the
     * dependency edges reference real file nodes (the edge endpoints and the nodes resolve to the
     * same id), instead of pointing at files that are absent from the tree.
     */
    fun parseFileNodes(dcProject: DcProject): List<Pair<Path, MutableNode>> = dcProject.leaves.values
        .map { it.physicalPath }
        .filter { it.isNotBlank() }
        .distinct()
        .mapNotNull { physicalPath ->
            val segments = physicalPath.split(PATH_SEPARATOR).filter { it.isNotBlank() }
            if (segments.isEmpty()) {
                null
            } else {
                Path(segments.dropLast(1)) to MutableNode(segments.last(), NodeType.File)
            }
        }

    fun parseEdges(dcProject: DcProject): List<Edge> = dcProject.leaves.values
        .filter { it.physicalPath.isNotBlank() }
        .flatMap { leaf -> resolveDependencyPaths(leaf, dcProject.leaves) }
        .groupingBy { it }
        .eachCount()
        .map { (paths, count) ->
            Edge(ROOT_PREFIX + paths.first, ROOT_PREFIX + paths.second, mapOf("dependencies" to count))
        }

    private fun resolveDependencyPaths(leaf: DcLeaf, leaves: Map<String, DcLeaf>): List<Pair<String, String>> {
        return leaf.dependencies.keys.mapNotNull { targetId ->
            val targetPath = leaves[targetId]?.physicalPath
            if (targetPath == null) {
                Logger.warn { "Target leaf '$targetId' not found, skipping dependency" }
                return@mapNotNull null
            }
            if (targetPath.isBlank() || leaf.physicalPath == targetPath) return@mapNotNull null
            Pair(leaf.physicalPath, targetPath)
        }
    }
}
