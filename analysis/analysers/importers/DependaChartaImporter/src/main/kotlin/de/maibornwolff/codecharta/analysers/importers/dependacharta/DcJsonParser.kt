package de.maibornwolff.codecharta.analysers.importers.dependacharta

import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

object DcJsonParser {
    private const val ROOT_PREFIX = "/" + NodeId.ROOT_SEGMENT

    /**
     * One [MutableNode] per unique leaf `physicalPath`, paired with the folder [Path] to insert it
     * under. DependaCharta describes symbols (classes/functions) but the code map is file-level, and
     * several symbols can share one file, so paths are de-duplicated. Building these nodes lets the
     * dependency edges reference real file nodes — the edge endpoints and the nodes are derived from
     * the same canonical path, so they resolve to the same id.
     */
    fun parseFileNodes(dcProject: DcProject): List<Pair<Path, MutableNode>> = dcProject.leaves.values
        .map { canonicalSegments(it.physicalPath) }
        .filter { it.isNotEmpty() }
        .distinct()
        .map { segments -> Path(segments.dropLast(1)) to MutableNode(segments.last(), NodeType.File) }

    fun parseEdges(dcProject: DcProject): List<Edge> = dcProject.leaves.values
        .flatMap { leaf -> resolveDependencies(leaf, dcProject.leaves) }
        .groupingBy { it }
        .eachCount()
        .map { (endpoints, count) -> Edge(endpoints.first, endpoints.second, mapOf("dependencies" to count)) }

    private fun resolveDependencies(leaf: DcLeaf, leaves: Map<String, DcLeaf>): List<Pair<String, String>> {
        val fromSegments = canonicalSegments(leaf.physicalPath)
        if (fromSegments.isEmpty()) return emptyList()

        return leaf.dependencies.keys.mapNotNull { targetId ->
            val target = leaves[targetId]
            if (target == null) {
                Logger.warn { "Target leaf '$targetId' not found, skipping dependency" }
                return@mapNotNull null
            }
            val toSegments = canonicalSegments(target.physicalPath)
            if (toSegments.isEmpty() || fromSegments == toSegments) return@mapNotNull null
            endpoint(fromSegments) to endpoint(toSegments)
        }
    }

    /** Canonical tree-position segments of a physical path, tolerant of `/` and `\` separators. */
    private fun canonicalSegments(physicalPath: String): List<String> =
        if (physicalPath.isBlank()) emptyList() else NodeId.canonicalSegments(physicalPath.split('/', '\\'))

    private fun endpoint(segments: List<String>): String = ROOT_PREFIX + NodeId.canonicalPath(segments)
}
