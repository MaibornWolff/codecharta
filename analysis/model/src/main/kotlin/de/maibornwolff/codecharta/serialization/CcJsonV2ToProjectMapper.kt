package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.MetricsLens
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.dto.CcJsonV2
import de.maibornwolff.codecharta.serialization.dto.FileDto
import de.maibornwolff.codecharta.util.Logger

/**
 * Maps the 2.0 wire DTO back onto the domain [Project]. Metrics are re-attached to nodes from the
 * metrics lens by id, the node/edge `attributeTypes` split is reconstructed, and edge endpoints are
 * rebuilt from ids by walking the file tree (the inverse of [ProjectToCcJsonV2Mapper]).
 */
object CcJsonV2ToProjectMapper {
    fun toProject(dto: CcJsonV2): Project {
        val metricsByNodeId = dto.lenses.metrics.attributes
        val rootFileDto = dto.files.single()
        val rootNode = toNode(rootFileDto, metricsByNodeId)

        val idToEndpoint = HashMap<String, String>()
        collectEndpoints(rootFileDto, emptyList(), idToEndpoint)
        // A metrics-lens entry whose id resolves to no file node is dropped on read (its bag is never
        // looked up in toNode). Warn on it, mirroring the edge-endpoint path, so the loss is not silent.
        metricsByNodeId.keys
            .filterNot { it in idToEndpoint }
            .forEach { orphanId -> Logger.warn { "Dropping metrics-lens entry with unresolved node id: $orphanId" } }
        val edges =
            dto.lenses.dependency.edges.mapNotNull { edge ->
                val from = idToEndpoint[edge.fromId]
                val to = idToEndpoint[edge.toId]
                if (from == null || to == null) {
                    Logger.warn { "Dropping edge with unresolved endpoint(s): fromId=${edge.fromId}, toId=${edge.toId}" }
                    return@mapNotNull null
                }
                Edge(from, to, edge.attributes)
            }

        val lenses =
            LensSet(
                metrics =
                    MetricsLens(
                        attributeTypes = dto.lenses.metrics.attributeTypes,
                        attributeDescriptors = dto.lenses.metrics.attributeDescriptors,
                        clusters = dto.lenses.metrics.clusters
                    ),
                dependency =
                    DependencyLens(
                        edges = edges,
                        attributeTypes = dto.lenses.dependency.attributeTypes,
                        attributeDescriptors = dto.lenses.dependency.attributeDescriptors
                    ),
                opaqueLenses = dto.lenses.opaqueLenses
            )

        return Project(
            projectName = dto.meta.projectName,
            nodes = listOf(rootNode),
            apiVersion = dto.meta.apiVersion,
            lenses = lenses,
            commitHash = dto.meta.commitHash
        )
    }

    private fun toNode(fileDto: FileDto, metricsByNodeId: Map<String, Map<String, Any>>): Node {
        val children = fileDto.children?.map { toNode(it, metricsByNodeId) } ?: emptyList()
        return Node(
            // NFC-normalize the name so the reconstructed tree agrees with the NFC edge endpoints
            // collectEndpoints derives (and with the node's own id): otherwise an NFD-named tree read
            // from 2.0 makes EdgeFilter's exact-string endpoint matching silently stop aggregating and
            // insert ghost NFC-named duplicate nodes.
            name = NodeId.normalizeName(fileDto.name),
            type = NodeType.parse(fileDto.type),
            attributes = metricsByNodeId[fileDto.id] ?: emptyMap(),
            link = fileDto.link,
            children = children.toSet(),
            checksum = fileDto.contentHash
        )
    }

    private fun collectEndpoints(fileDto: FileDto, segments: List<String>, idToEndpoint: MutableMap<String, String>) {
        idToEndpoint[fileDto.id] = NodeId.endpointFromSegments(segments)
        fileDto.children?.forEach { child -> collectEndpoints(child, segments + child.name, idToEndpoint) }
    }
}
