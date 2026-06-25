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

/**
 * Maps the 2.0 wire DTO back onto the domain [Project]. Metrics are re-attached to nodes from the
 * metrics lens by id, the node/edge `attributeTypes` split is reconstructed, and edge endpoints are
 * rebuilt from ids by walking the file tree (the inverse of [ProjectToCcJsonV2Mapper]).
 */
object CcJsonV2ToProjectMapper {
    private const val ROOT_ENDPOINT_PREFIX = "/" + NodeId.ROOT_SEGMENT

    fun toProject(dto: CcJsonV2): Project {
        val metricsByNodeId = dto.lenses.metrics.attributes
        val rootFileDto = dto.files.single()
        val rootNode = toNode(rootFileDto, metricsByNodeId)

        val idToEndpoint = HashMap<String, String>()
        collectEndpoints(rootFileDto, emptyList(), idToEndpoint)
        val edges =
            dto.lenses.dependency.edges.map {
                Edge(idToEndpoint[it.fromId] ?: it.fromId, idToEndpoint[it.toId] ?: it.toId, it.attributes)
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
                domain = dto.lenses.domain,
                security = dto.lenses.security,
                additionalLenses = dto.lenses.additionalLenses
            )

        return Project(
            projectName = dto.meta.projectName,
            nodes = listOf(rootNode),
            apiVersion = dto.meta.apiVersion,
            lenses = lenses
        )
    }

    private fun toNode(fileDto: FileDto, metricsByNodeId: Map<String, Map<String, Any>>): Node {
        val children = fileDto.children?.map { toNode(it, metricsByNodeId) } ?: emptyList()
        return Node(
            name = fileDto.name,
            type = NodeType.valueOf(fileDto.type),
            attributes = metricsByNodeId[fileDto.id] ?: emptyMap(),
            link = fileDto.link ?: "",
            children = children.toSet(),
            checksum = fileDto.contentHash
        )
    }

    private fun collectEndpoints(fileDto: FileDto, segments: List<String>, idToEndpoint: MutableMap<String, String>) {
        idToEndpoint[fileDto.id] = ROOT_ENDPOINT_PREFIX + NodeId.canonicalPath(segments)
        fileDto.children?.forEach { child -> collectEndpoints(child, segments + child.name, idToEndpoint) }
    }
}
