package de.maibornwolff.codecharta.analysers.importers.dependacharta

import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.util.Logger

object DcJsonParser {
    const val DEPENDENCIES = "dependencies"
    const val OUTGOING_DEPENDENCIES = "outgoing_dependencies"
    const val INCOMING_DEPENDENCIES = "incoming_dependencies"

    /**
     * The canonical tree-position segments of every leaf, keyed by leaf id and computed once. Both
     * the edge and the file-node building derive from this, so a physical path is canonicalized a
     * single time instead of once per leaf and again per referencing edge.
     */
    fun canonicalSegmentsByLeafId(dcProject: DcProject): Map<String, List<String>> =
        dcProject.leaves.mapValues { (_, leaf) -> canonicalSegments(leaf.physicalPath) }

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
    fun parseFileNodes(
        dcProject: DcProject,
        edges: List<Edge> = emptyList(),
        segmentsByLeafId: Map<String, List<String>> = canonicalSegmentsByLeafId(dcProject)
    ): List<Pair<Path, MutableNode>> {
        val outgoing = edges.groupBy { it.fromNodeName }.mapValues { (_, group) -> group.sumOf { dependencyCount(it) } }
        val incoming = edges.groupBy { it.toNodeName }.mapValues { (_, group) -> group.sumOf { dependencyCount(it) } }

        return segmentsByLeafId.values
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

    fun parseEdges(dcProject: DcProject, segmentsByLeafId: Map<String, List<String>> = canonicalSegmentsByLeafId(dcProject)): List<Edge> =
        dcProject.leaves.entries
            .flatMap { (leafId, leaf) -> resolveDependencies(leafId, leaf, segmentsByLeafId) }
            .groupingBy { it }
            .eachCount()
            .map { (endpoints, count) -> Edge(endpoints.first, endpoints.second, mapOf(DEPENDENCIES to count)) }

    private fun resolveDependencies(leafId: String, leaf: DcLeaf, segmentsByLeafId: Map<String, List<String>>): List<Pair<String, String>> {
        val fromSegments = segmentsByLeafId.getValue(leafId)
        if (fromSegments.isEmpty()) return emptyList()

        return leaf.dependencies.keys.mapNotNull { targetId ->
            val toSegments = segmentsByLeafId[targetId]
            if (toSegments == null) {
                Logger.warn { "Target leaf '$targetId' not found, skipping dependency" }
                return@mapNotNull null
            }
            if (toSegments.isEmpty() || fromSegments == toSegments) return@mapNotNull null
            endpoint(fromSegments) to endpoint(toSegments)
        }
    }

    /** Canonical tree-position segments of a physical path, tolerant of `/` and `\` separators. */
    private fun canonicalSegments(physicalPath: String): List<String> =
        if (physicalPath.isBlank()) emptyList() else NodeId.canonicalSegments(physicalPath.split('/', '\\'))

    private fun endpoint(segments: List<String>): String = NodeId.endpointFromSegments(segments)
}
