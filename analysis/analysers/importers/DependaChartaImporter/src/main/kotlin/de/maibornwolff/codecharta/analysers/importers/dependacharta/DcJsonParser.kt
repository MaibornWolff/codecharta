package de.maibornwolff.codecharta.analysers.importers.dependacharta

import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

object DcJsonParser {
    private const val DEPENDENCIES = "dependencies"
    const val OUTGOING_DEPENDENCIES = "outgoing_dependencies"
    const val INCOMING_DEPENDENCIES = "incoming_dependencies"

    /**
     * One [MutableNode] per unique leaf `physicalPath`, paired with the folder [Path] to insert it
     * under. DependaCharta describes symbols (classes/functions) but the code map is file-level, and
     * several symbols can share one file, so paths are de-duplicated. Building these nodes lets the
     * dependency edges reference real file nodes — the edge endpoints and the nodes are derived from
     * the same canonical path, so they resolve to the same id.
     *
     * Each file node carries its aggregated [OUTGOING_DEPENDENCIES]/[INCOMING_DEPENDENCIES] weight
     * (summed from [edges]) so a DependaCharta map has a default node metric to size buildings by,
     * instead of only the edge metric.
     */
    fun parseFileNodes(dcProject: DcProject, edges: List<Edge> = emptyList()): List<Pair<Path, MutableNode>> {
        val outgoing = edges.groupBy { it.fromNodeName }.mapValues { (_, group) -> group.sumOf { dependencyCount(it) } }
        val incoming = edges.groupBy { it.toNodeName }.mapValues { (_, group) -> group.sumOf { dependencyCount(it) } }

        return dcProject.leaves.values
            .map { canonicalSegments(it.physicalPath) }
            .filter { it.isNotEmpty() }
            .distinct()
            .map { segments ->
                val endpoint = endpoint(segments)
                val attributes = mapOf<String, Any>(
                    OUTGOING_DEPENDENCIES to (outgoing[endpoint] ?: 0),
                    INCOMING_DEPENDENCIES to (incoming[endpoint] ?: 0)
                )
                Path(segments.dropLast(1)) to MutableNode(segments.last(), NodeType.File, attributes)
            }
    }

    private fun dependencyCount(edge: Edge): Int = (edge.attributes[DEPENDENCIES] as? Number)?.toInt() ?: 0

    fun parseEdges(dcProject: DcProject): List<Edge> = dcProject.leaves.values
        .flatMap { leaf -> resolveDependencies(leaf, dcProject.leaves) }
        .groupingBy { it }
        .eachCount()
        .map { (endpoints, count) -> Edge(endpoints.first, endpoints.second, mapOf(DEPENDENCIES to count)) }

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

    private fun endpoint(segments: List<String>): String = NodeId.endpointFromSegments(segments)
}
