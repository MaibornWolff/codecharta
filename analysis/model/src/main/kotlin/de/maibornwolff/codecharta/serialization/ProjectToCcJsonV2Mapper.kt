package de.maibornwolff.codecharta.serialization

import com.google.gson.reflect.TypeToken
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
import de.maibornwolff.codecharta.util.Logger
import java.io.ByteArrayOutputStream
import java.io.OutputStream
import java.io.OutputStreamWriter
import java.nio.charset.StandardCharsets
import java.security.DigestOutputStream
import java.security.MessageDigest

object ProjectToCcJsonV2Mapper {
    private val FILES_TYPE = object : TypeToken<List<FileDto>>() {}.type
    private val DOCUMENT_META_PREFIX = "{\"meta\":".toByteArray(StandardCharsets.UTF_8)
    private val BODY_SEPARATOR = ",".toByteArray(StandardCharsets.UTF_8)
    private val DOCUMENT_SUFFIX = "}".toByteArray(StandardCharsets.UTF_8)

    fun toDto(project: Project, commitHash: String? = project.commitHash): CcJsonV2 {
        val (files, lenses) = buildFilesAndLenses(project)
        val checksum = serializeBody(files, lenses).second
        return CcJsonV2(buildMeta(project, checksum, commitHash), files, lenses)
    }

    fun writeProject(project: Project, out: OutputStream, commitHash: String? = project.commitHash) {
        val (files, lenses) = buildFilesAndLenses(project)
        val (bodyBytes, checksum) = serializeBody(files, lenses)
        val metaJson = CcJsonV2Gson.gson.toJson(buildMeta(project, checksum, commitHash))
        out.write(DOCUMENT_META_PREFIX)
        out.write(metaJson.toByteArray(StandardCharsets.UTF_8))
        out.write(BODY_SEPARATOR)
        // bodyBytes is `{"files":…,"lenses":…}`; splice its inner keys between meta and the closing brace.
        out.write(bodyBytes, 1, bodyBytes.size - 2)
        out.write(DOCUMENT_SUFFIX)
    }

    private fun buildFilesAndLenses(project: Project): Pair<List<FileDto>, LensesDto> {
        val rootNode = materializeEdgeEndpoints(project.rootNode, project.lenses.dependency.edges)
        val typeByCanonicalPath = HashMap<String, NodeType>()
        collectTypesByCanonicalPath(rootNode, emptyList(), typeByCanonicalPath)
        val metricsByNodeId = LinkedHashMap<String, Map<String, Any>>()
        val files = listOf(toFileDto(rootNode, emptyList(), metricsByNodeId, HashSet()))

        val metricsLens =
            MetricsLensDto(
                attributes = metricsByNodeId,
                attributeDescriptors = project.lenses.metrics.attributeDescriptors,
                attributeTypes = project.lenses.metrics.attributeTypes
            )
        val dependencyLens =
            DependencyLensDto(
                edges =
                    project.lenses.dependency.edges.map {
                        EdgeDto(
                            edgeEndpointId(it.fromNodeName, typeByCanonicalPath),
                            edgeEndpointId(it.toNodeName, typeByCanonicalPath),
                            it.attributes
                        )
                    },
                attributeTypes = project.lenses.dependency.attributeTypes,
                attributeDescriptors = project.lenses.dependency.attributeDescriptors
            )
        return files to
            LensesDto(
                metrics = metricsLens,
                dependency = dependencyLens,
                domain = project.lenses.domain,
                opaqueLenses = project.lenses.opaqueLenses
            )
    }

    private fun buildMeta(project: Project, checksum: String, commitHash: String?): MetaDto = MetaDto(
        projectName = project.projectName,
        apiVersion = ApiVersion.TWO_ZERO.versionString,
        checksum = checksum,
        commitHash = commitHash
    )

    // Ensure every edge endpoint has a file node so it resolves by id after a 2.0 round-trip.
    private fun materializeEdgeEndpoints(root: Node, edges: List<Edge>): Node {
        if (edges.isEmpty()) return root
        val existingPaths = HashSet<String>()
        collectCanonicalPaths(root, emptyList(), existingPaths)
        val missing = edges
            .flatMap { listOf(it.fromNodeName, it.toNodeName) }
            .map { NodeId.segmentsFromEndpoint(it) }
            // Existence is by canonical PATH, not id: an endpoint whose path already has a node (of any
            // type) resolves to that node, so only genuinely-absent paths are materialized as Files.
            .filter { it.isNotEmpty() && NodeId.canonicalPath(it) !in existingPaths }
            .distinct()
        if (missing.isEmpty()) return root
        // Surface producer leaks in ccsh output: an edge whose endpoint has no node is materialized here
        // (needed for edge-only producers like CodeMaat), but a large count usually signals a producer
        // emitting edges to renamed or deleted paths (see GitLogParser coupling edges).
        Logger.warn {
            "${missing.size} dependency edge endpoint(s) had no matching node and were materialized as empty File nodes"
        }
        val mutableRoot = root.toMutableNode()
        missing.forEach { segments ->
            mutableRoot.insertAt(Path(segments.dropLast(1)), MutableNode(segments.last(), NodeType.File))
        }
        return mutableRoot.toNode()
    }

    private fun collectCanonicalPaths(node: Node, segments: List<String>, into: MutableSet<String>) {
        into.add(NodeId.canonicalPath(segments))
        node.children.forEach { child -> collectCanonicalPaths(child, segments + child.name, into) }
    }

    // Map canonical path → node type so edge endpoints can be hashed with the real type of the node they target.
    private fun collectTypesByCanonicalPath(node: Node, segments: List<String>, into: MutableMap<String, NodeType>) {
        into.merge(NodeId.canonicalPath(segments), node.type ?: NodeType.File) { existing, candidate ->
            if (existing.ordinal <= candidate.ordinal) existing else candidate
        }
        node.children.forEach { child -> collectTypesByCanonicalPath(child, segments + child.name, into) }
    }

    private fun edgeEndpointId(endpoint: String, typeByCanonicalPath: Map<String, NodeType>): String {
        val type = typeByCanonicalPath[NodeId.canonicalPathFromEndpoint(endpoint)] ?: NodeType.File
        return NodeId.fromEndpoint(endpoint, type)
    }

    private fun toFileDto(
        node: Node,
        segments: List<String>,
        metricsByNodeId: MutableMap<String, Map<String, Any>>,
        seenIds: MutableSet<String>
    ): FileDto {
        val type = node.type ?: NodeType.File
        val id = NodeId.fromSegments(segments, type)
        // Unconditional: every node (folders and edge-materialized empties included) must own a unique
        // id, so a collision fails loud instead of silently overwriting a metrics bag or dropping a node.
        require(seenIds.add(id)) {
            "Duplicate node id '$id' for ${type.name} ${NodeId.canonicalPath(segments)}; two nodes collide on one id"
        }
        if (node.attributes.isNotEmpty()) {
            metricsByNodeId[id] = node.attributes
        }
        // Emit siblings in a canonical order (NFC name, then File before Folder) so the files tree, the
        // DFS-populated metrics-lens key order, and thus meta.checksum are byte-stable regardless of how
        // producers or merges happened to order children. Sorting the input before recursion is what keeps
        // the metrics LinkedHashMap canonical too.
        val children =
            node.children
                .sortedWith(compareBy({ NodeId.normalizeName(it.name) }, { (it.type ?: NodeType.File).ordinal }))
                .map { child -> toFileDto(child, segments + child.name, metricsByNodeId, seenIds) }
        return FileDto(
            id = id,
            // NFC-normalize the emitted name so the wire is self-consistent with its NFC id and edge
            // endpoints: a freshly-written file then has name==id normalization form, and a 2.0
            // round-trip is byte-idempotent (stable meta.checksum). The domain keeps original spelling.
            name = NodeId.normalizeName(node.name),
            type = type.name,
            children = children.ifEmpty { null },
            contentHash = node.checksum,
            // Pass link through verbatim for exact 1.5 parity: GSON omits null and emits "" as is.
            link = node.link
        )
    }

    private fun serializeBody(files: List<FileDto>, lenses: LensesDto): Pair<ByteArray, String> {
        val digest = MessageDigest.getInstance("MD5")
        val buffer = ByteArrayOutputStream()
        OutputStreamWriter(DigestOutputStream(buffer, digest), StandardCharsets.UTF_8).use { writer ->
            writer.append("{\"files\":")
            CcJsonV2Gson.gson.toJson(files, FILES_TYPE, writer)
            writer.append(",\"lenses\":")
            CcJsonV2Gson.gson.toJson(lenses, LensesDto::class.java, writer)
            writer.append("}")
        }
        return buffer.toByteArray() to Checksum.hex(digest.digest())
    }
}
