package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonObject
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.dto.CcJsonV2
import de.maibornwolff.codecharta.serialization.dto.DependencyLensDto
import de.maibornwolff.codecharta.serialization.dto.EdgeDto
import de.maibornwolff.codecharta.serialization.dto.FileDto
import de.maibornwolff.codecharta.serialization.dto.LensesDto
import de.maibornwolff.codecharta.serialization.dto.MetaDto
import de.maibornwolff.codecharta.serialization.dto.MetricsLensDto
import de.maibornwolff.codecharta.util.Checksum

/**
 * Maps the domain [Project] onto the 2.0 wire DTO. This is the only place where metrics are lifted
 * off file nodes into the metrics lens (keyed by [NodeId]) and where edge endpoint strings are
 * resolved to node ids. The domain still carries metrics on nodes and edges as path strings; the
 * lens-native domain (Stage B) makes this mapping near-trivial.
 */
object ProjectToCcJsonV2Mapper {
    fun toDto(project: Project, commitHash: String? = project.commitHash): CcJsonV2 {
        val rootNode = materializeEdgeEndpoints(project.rootNode, project.lenses.dependency.edges)
        val metricsByNodeId = LinkedHashMap<String, Map<String, Any>>()
        val files = listOf(toFileDto(rootNode, emptyList(), metricsByNodeId))

        val metricsLens =
            MetricsLensDto(
                attributes = metricsByNodeId,
                attributeDescriptors = project.lenses.metrics.attributeDescriptors,
                attributeTypes = project.lenses.metrics.attributeTypes,
                clusters = project.lenses.metrics.clusters
            )
        val dependencyLens =
            DependencyLensDto(
                edges =
                    project.lenses.dependency.edges.map {
                        EdgeDto(NodeId.fromEndpoint(it.fromNodeName), NodeId.fromEndpoint(it.toNodeName), it.attributes)
                    },
                attributeTypes = project.lenses.dependency.attributeTypes,
                attributeDescriptors = project.lenses.dependency.attributeDescriptors
            )
        val lenses =
            LensesDto(
                metrics = metricsLens,
                dependency = dependencyLens,
                opaqueLenses = project.lenses.opaqueLenses
            )

        val meta =
            MetaDto(
                projectName = project.projectName,
                apiVersion = ApiVersion.TWO_ZERO.versionString,
                checksum = computeChecksum(files, lenses),
                commitHash = commitHash
            )
        return CcJsonV2(meta, files, lenses)
    }

    /**
     * Ensure every dependency edge endpoint has a real file node so it resolves by id after a 2.0
     * round-trip. Edge-only producers (e.g. CodeMaatImporter) emit a bare root plus edges; without
     * this the reader drops every edge as unresolved because only the endpoint hash — never the path —
     * survives on the wire. Endpoints already backed by a node are left untouched (a no-op for normal
     * projects); only genuinely-missing ones are materialized as empty File nodes. This is the 1.5
     * EdgeFilter.insertEmptyNodesFromEdges behaviour, moved to the single serialization boundary so it
     * covers every edge-only producer.
     */
    private fun materializeEdgeEndpoints(root: Node, edges: List<Edge>): Node {
        if (edges.isEmpty()) return root
        val existingIds = HashSet<String>()
        collectIds(root, emptyList(), existingIds)
        val missing = edges
            .flatMap { listOf(it.fromNodeName, it.toNodeName) }
            .map { NodeId.segmentsFromEndpoint(it) }
            .filter { it.isNotEmpty() && NodeId.fromSegments(it) !in existingIds }
            .distinct()
        if (missing.isEmpty()) return root
        val mutableRoot = root.toMutableNode()
        missing.forEach { segments ->
            mutableRoot.insertAt(Path(segments.dropLast(1)), MutableNode(segments.last(), NodeType.File))
        }
        return mutableRoot.toNode()
    }

    private fun collectIds(node: Node, segments: List<String>, into: MutableSet<String>) {
        into.add(NodeId.fromSegments(segments))
        node.children.forEach { child -> collectIds(child, segments + child.name, into) }
    }

    private fun toFileDto(node: Node, segments: List<String>, metricsByNodeId: MutableMap<String, Map<String, Any>>): FileDto {
        val id = NodeId.fromSegments(segments)
        if (node.attributes.isNotEmpty()) {
            require(id !in metricsByNodeId) {
                "Duplicate node id '$id' for ${NodeId.canonicalPath(segments)}; two tree positions collide in the metrics lens"
            }
            metricsByNodeId[id] = node.attributes
        }
        val children = node.children.map { child -> toFileDto(child, segments + child.name, metricsByNodeId) }
        return FileDto(
            id = id,
            name = node.name,
            type = (node.type ?: NodeType.File).name,
            children = children.ifEmpty { null },
            contentHash = node.checksum,
            // Pass link through verbatim for exact 1.5 parity: GSON omits null and emits "" as is.
            link = node.link
        )
    }

    private fun computeChecksum(files: List<FileDto>, lenses: LensesDto): String {
        val payload = JsonObject()
        payload.add("files", CcJsonV2Gson.gson.toJsonTree(files))
        payload.add("lenses", CcJsonV2Gson.gson.toJsonTree(lenses))
        // Intentional second serialization: the checksum lives in `meta`, which is written before the
        // body, so files+lenses are serialized here for hashing and again by the outer writer.
        return Checksum.md5(CcJsonV2Gson.gson.toJson(payload))
    }
}
