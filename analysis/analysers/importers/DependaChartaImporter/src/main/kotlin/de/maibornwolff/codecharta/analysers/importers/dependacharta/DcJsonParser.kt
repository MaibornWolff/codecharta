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

    fun canonicalSegmentsByLeafId(dcProject: DcProject): Map<String, List<String>> =
        dcProject.leaves.mapValues { (_, leaf) -> canonicalSegments(leaf.physicalPath) }

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
