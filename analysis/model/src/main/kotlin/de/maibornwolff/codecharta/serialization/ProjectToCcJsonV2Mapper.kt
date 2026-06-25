package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonObject
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.dto.CcJsonV2
import de.maibornwolff.codecharta.serialization.dto.DependencyLensDto
import de.maibornwolff.codecharta.serialization.dto.EdgeDto
import de.maibornwolff.codecharta.serialization.dto.FileDto
import de.maibornwolff.codecharta.serialization.dto.LensesDto
import de.maibornwolff.codecharta.serialization.dto.MetaDto
import de.maibornwolff.codecharta.serialization.dto.MetricsLensDto
import java.math.BigInteger
import java.security.MessageDigest

/**
 * Maps the domain [Project] onto the 2.0 wire DTO. This is the only place where metrics are lifted
 * off file nodes into the metrics lens (keyed by [NodeId]) and where edge endpoint strings are
 * resolved to node ids. The domain still carries metrics on nodes and edges as path strings; the
 * lens-native domain (Stage B) makes this mapping near-trivial.
 */
object ProjectToCcJsonV2Mapper {
    fun toDto(project: Project, commitHash: String? = project.commitHash): CcJsonV2 {
        val metricsByNodeId = LinkedHashMap<String, Map<String, Any>>()
        val files = listOf(toFileDto(project.rootNode, emptyList(), metricsByNodeId))

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
                domain = project.lenses.domain,
                security = project.lenses.security,
                additionalLenses = project.lenses.additionalLenses
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

    private fun toFileDto(node: Node, segments: List<String>, metricsByNodeId: MutableMap<String, Map<String, Any>>): FileDto {
        val id = NodeId.fromSegments(segments)
        if (node.attributes.isNotEmpty()) {
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
        val md5 = MessageDigest.getInstance("MD5").digest(CcJsonV2Gson.gson.toJson(payload).toByteArray())
        return BigInteger(1, md5).toString(16).padStart(32, '0')
    }
}
