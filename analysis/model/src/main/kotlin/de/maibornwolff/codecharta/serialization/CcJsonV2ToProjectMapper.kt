package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.DependencyLeaf
import de.maibornwolff.codecharta.model.DependencyLens
import de.maibornwolff.codecharta.model.DependencyNode
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LeafEdge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.MetricsLens
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.dto.CcJsonV2
import de.maibornwolff.codecharta.serialization.dto.DependencyLeafDto
import de.maibornwolff.codecharta.serialization.dto.FileDto
import de.maibornwolff.codecharta.serialization.dto.LeafEdgeDto
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
                Edge(from, to, edge.attributes.orEmpty(), edge.isCyclic == true, edge.isPointingUpwards == true)
            }

        val fileNodeIds = HashSet<String>()
        collectFileNodeIds(rootFileDto, fileNodeIds)
        val leaves = resolveLeaves(dto, fileNodeIds)
        val lenses =
            LensSet(
                metrics =
                    MetricsLens(
                        attributeTypes = dto.lenses.metrics.attributeTypes,
                        attributeDescriptors = dto.lenses.metrics.attributeDescriptors
                    ),
                dependency =
                    DependencyLens(
                        edges = edges,
                        attributeTypes = dto.lenses.dependency.attributeTypes,
                        attributeDescriptors = dto.lenses.dependency.attributeDescriptors,
                        nodes = resolveDependencyNodes(dto, idToEndpoint.keys),
                        namespaces = dto.lenses.dependency.namespaces.orEmpty(),
                        leaves = leaves,
                        leafEdges = resolveLeafEdges(dto, fileNodeIds, leaves)
                    ),
                domain = dto.lenses.domain,
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

    // Keys are node ids and stay node ids in the model; an entry whose node the file does not declare
    // would reference nothing, so it is dropped with a warning like an unresolved edge endpoint.
    private fun resolveDependencyNodes(dto: CcJsonV2, knownNodeIds: Set<String>): Map<String, DependencyNode> {
        val declared = dto.lenses.dependency.nodes ?: return emptyMap()
        declared.keys
            .filterNot { it in knownNodeIds }
            .forEach { orphanId -> Logger.warn { "Dropping dependency-lens entry with unresolved node id: $orphanId" } }
        return declared.filterKeys { it in knownNodeIds }
    }

    // Leaves are grouped under the id of their file node, so the leaves of an id that is no file node of this
    // document have nothing to join onto and are dropped with a warning like an unresolved edge endpoint.
    private fun resolveLeaves(dto: CcJsonV2, fileNodeIds: Set<String>): Map<String, Map<String, DependencyLeaf>> {
        val declared = dto.lenses.dependency.leaves ?: return emptyMap()
        declared.keys
            .filterNot { it in fileNodeIds }
            .forEach { orphanId -> Logger.warn { "Dropping dependency-lens leaves with unresolved file node id: $orphanId" } }
        return declared
            .filterKeys { it in fileNodeIds }
            .mapValues { (_, leavesOfFile) ->
                leavesOfFile.mapValues { (_, leaf) -> leaf.toModel() }
            }
    }

    private fun DependencyLeafDto.toModel(): DependencyLeaf = DependencyLeaf(
        kind = kind,
        name = name,
        language = language,
        namespace = namespace,
        parent = parent,
        level = level
    )

    // A file that carries leaf edges without any leaves declares no declarations to check the leaf keys
    // against, so only the node ids are resolved.
    private fun resolveLeafEdges(
        dto: CcJsonV2,
        fileNodeIds: Set<String>,
        leaves: Map<String, Map<String, DependencyLeaf>>
    ): List<LeafEdge> {
        val declared = dto.lenses.dependency.leafEdges ?: return emptyList()
        val (resolved, unresolved) =
            declared.map { it.toModel() }.partition { edge ->
                edge.fromId in fileNodeIds && edge.toId in fileNodeIds && (leaves.isEmpty() || edge.joinsOnto(leaves))
            }
        unresolved.forEach { edge ->
            Logger.warn { "Dropping leaf edge with unresolved endpoint(s): ${edge.fromId}/${edge.fromLeaf} -> ${edge.toId}/${edge.toLeaf}" }
        }
        return resolved
    }

    private fun LeafEdgeDto.toModel(): LeafEdge = LeafEdge(
        fromId = fromId,
        fromLeaf = fromLeaf,
        toId = toId,
        toLeaf = toLeaf,
        attributes = attributes.orEmpty(),
        usage = usage.orEmpty(),
        isCyclic = isCyclic == true,
        isPointingUpwards = isPointingUpwards == true
    )

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

    private fun collectFileNodeIds(fileDto: FileDto, fileNodeIds: MutableSet<String>) {
        if (fileDto.type == NodeType.File.name) fileNodeIds.add(fileDto.id)
        fileDto.children?.forEach { child -> collectFileNodeIds(child, fileNodeIds) }
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
