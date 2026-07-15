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
            // NFC-normalize each segment so it agrees with NodeId.normalizeName (macOS NFD vs Linux NFC).
            name = NodeId.normalizeName(fileDto.name),
            type = NodeType.parse(fileDto.type),
            attributes = metricsByNodeId[fileDto.id] ?: emptyMap(),
            link = fileDto.link,
            children = children.toSet(),
            checksum = fileDto.contentHash
        )
    }

    private fun collectEndpoints(fileDto: FileDto, segments: List<String>, idToEndpoint: MutableMap<String, String>) {
        // Two file nodes sharing an id is only possible in foreign/hand-authored 2.0 input (the writer
        // derives every id from its unique tree position). Keep the first-declared binding and warn, so a
        // colliding id surfaces instead of silently re-pointing this id's edges at the last node.
        val existingEndpoint = idToEndpoint.putIfAbsent(fileDto.id, NodeId.endpointFromSegments(segments))
        if (existingEndpoint != null) {
            Logger.warn { "Duplicate node id '${fileDto.id}'; keeping the first node and ignoring later ones." }
        }
        fileDto.children?.forEach { child -> collectEndpoints(child, segments + child.name, idToEndpoint) }
    }
}
