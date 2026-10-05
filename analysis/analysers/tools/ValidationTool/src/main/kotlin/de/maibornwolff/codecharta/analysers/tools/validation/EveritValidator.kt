package de.maibornwolff.codecharta.analysers.tools.validation

import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.serialization.ApiVersion
import de.maibornwolff.codecharta.serialization.CompressedStreamHandler
import de.maibornwolff.codecharta.serialization.LegacyFileException
import org.everit.json.schema.Schema
import org.everit.json.schema.loader.SchemaLoader
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener
import java.io.InputStream

class EveritValidator(private var schemaPath: String) : Validator {
    private var schema = loadSchema()

    private fun loadSchema(): Schema {
        val input = this.javaClass.classLoader.getResourceAsStream(schemaPath)
        val rawJson = JSONObject(JSONTokener(input))
        // Draft-07 support so the schema's if/then (e.g. a File node may not have children) is enforced.
        return SchemaLoader
            .builder()
            .draftV7Support()
            .schemaJson(rawJson)
            .build()
            .load()
            .build()
    }

    override fun validate(input: InputStream) {
        val content = CompressedStreamHandler.wrapInput(input)
        val json = JSONObject(JSONTokener(content))
        content.close()
        rejectLegacyDocument(json)
        schema.validate(json)
        checkReferentialIntegrity(json)
    }

    private fun rejectLegacyDocument(json: JSONObject) {
        val metaApiVersion = json.optJSONObject("meta")?.optString("apiVersion")?.takeIf { it.isNotBlank() }
        val major = metaApiVersion?.substringBefore('.') ?: if (json.has("lenses")) "2" else "1"
        val looksLegacy = json.has("nodes") || json.optJSONObject("data") != null || json.has("apiVersion")
        if (major != ApiVersion.TWO_ONE.major.toString() && looksLegacy) {
            throw LegacyFileException(LegacyFileException.CONVERT_HINT)
        }
    }

    private fun checkReferentialIntegrity(json: JSONObject) {
        val files = json.optJSONArray("files") ?: return
        val nodeIds = HashSet<String>()
        val fileNodeIds = HashSet<String>()
        for (index in 0 until files.length()) {
            collectNodeIds(files.getJSONObject(index), nodeIds, fileNodeIds)
        }

        val lenses = json.optJSONObject("lenses") ?: return
        val dependency = lenses.optJSONObject("dependency")
        val danglingReferences = collectDanglingMetricsAttributes(lenses, nodeIds) +
            collectDanglingEdgeEndpoints(dependency, nodeIds) +
            collectDanglingDependencyNodes(dependency, nodeIds) +
            collectDanglingLeafReferences(dependency, fileNodeIds) +
            collectDanglingNamespaceParents(dependency) +
            collectDanglingLeafEdgeEndpoints(dependency, fileNodeIds)

        if (danglingReferences.isNotEmpty()) {
            throw ReferentialIntegrityException(
                "This cc.json has references that do not resolve to a node id, leaf or namespace it declares: " +
                    danglingReferences.joinToString("; ") + "."
            )
        }
    }

    private fun collectDanglingMetricsAttributes(lenses: JSONObject, nodeIds: Set<String>): List<String> = lenses
        .optJSONObject("metrics")
        ?.optJSONObject("attributes")
        ?.keySet()
        .orEmpty()
        .filter { it !in nodeIds }
        .map { "metrics-lens entry for unknown node id '$it'" }

    private fun collectDanglingEdgeEndpoints(dependency: JSONObject?, nodeIds: Set<String>): List<String> {
        val edges = dependency?.optJSONArray("edges") ?: return emptyList()
        val danglingReferences = mutableListOf<String>()
        for (index in 0 until edges.length()) {
            val edge = edges.getJSONObject(index)
            val fromId = edge.optString("fromId")
            val toId = edge.optString("toId")
            if (fromId !in nodeIds) danglingReferences.add("edge with unknown fromId '$fromId'")
            if (toId !in nodeIds) danglingReferences.add("edge with unknown toId '$toId'")
        }
        return danglingReferences
    }

    private fun collectDanglingDependencyNodes(dependency: JSONObject?, nodeIds: Set<String>): List<String> = dependency
        ?.optJSONObject("nodes")
        ?.keySet()
        .orEmpty()
        .filter { it !in nodeIds }
        .map { "dependency-lens node entry for unknown node id '$it'" }

    private fun collectDanglingLeafReferences(dependency: JSONObject?, fileNodeIds: Set<String>): List<String> {
        val leaves = dependency?.optJSONObject(LEAVES_KEY) ?: return emptyList()
        val namespaces = dependency.optJSONObject(NAMESPACES_KEY)?.keySet().orEmpty()
        return leaves.keySet().flatMap { nodeId ->
            val leavesOfFile = leaves.getJSONObject(nodeId)
            val unknownNode =
                if (nodeId in fileNodeIds) emptyList() else listOf("dependency-lens leaves for unknown file node id '$nodeId'")
            unknownNode + leavesOfFile.keySet().flatMap { leafKey -> danglingReferencesOfLeaf(leafKey, leavesOfFile, namespaces) }
        }
    }

    private fun danglingReferencesOfLeaf(leafKey: String, leavesOfFile: JSONObject, namespaces: Set<String>): List<String> {
        val leaf = leavesOfFile.getJSONObject(leafKey)
        val namespace = leaf.optString(NAMESPACE_KEY, null)
        val parent = leaf.optString(PARENT_KEY, null)
        return listOfNotNull(
            "dependency-lens leaf '$leafKey' with unknown namespace '$namespace'".takeIf { namespace != null && namespace !in namespaces },
            "dependency-lens leaf '$leafKey' with unknown parent '$parent'".takeIf { parent != null && !leavesOfFile.has(parent) },
            "dependency-lens leaf '$leafKey' with a cyclic parent chain".takeIf { hasCyclicParentChain(leafKey, leavesOfFile) }
        )
    }

    private fun collectDanglingNamespaceParents(dependency: JSONObject?): List<String> {
        val namespaces = dependency?.optJSONObject(NAMESPACES_KEY) ?: return emptyList()
        return namespaces.keySet().flatMap { namespaceKey ->
            val parent = namespaces.getJSONObject(namespaceKey).optString(PARENT_KEY, null)
            listOfNotNull(
                "dependency-lens namespace '$namespaceKey' with unknown parent '$parent'".takeIf {
                    parent != null &&
                        !namespaces.has(
                            parent
                        )
                },
                "dependency-lens namespace '$namespaceKey' with a cyclic parent chain".takeIf {
                    hasCyclicParentChain(
                        namespaceKey,
                        namespaces
                    )
                }
            )
        }
    }

    private fun hasCyclicParentChain(key: String, siblings: JSONObject): Boolean {
        val visited = HashSet<String>()
        var current: String? = key
        while (current != null) {
            if (!visited.add(current)) return true
            current = siblings.optJSONObject(current)?.optString(PARENT_KEY, null)
        }
        return false
    }

    // A file that carries leaf edges without a leaf table declares no declarations to check the leaf keys
    // against, so only the node ids are checked.
    private fun collectDanglingLeafEdgeEndpoints(dependency: JSONObject?, fileNodeIds: Set<String>): List<String> {
        val leafEdges = dependency?.optJSONArray("leafEdges") ?: return emptyList()
        val leaves = dependency.optJSONObject(LEAVES_KEY)
        return (0 until leafEdges.length()).flatMap { index ->
            val leafEdge = leafEdges.getJSONObject(index)
            LeafEdgeEnd.entries.flatMap { end -> danglingLeafEdgeEndpoint(leafEdge, end, fileNodeIds, leaves) }
        }
    }

    private fun danglingLeafEdgeEndpoint(
        leafEdge: JSONObject,
        end: LeafEdgeEnd,
        fileNodeIds: Set<String>,
        leaves: JSONObject?
    ): List<String> {
        val nodeId = leafEdge.optString(end.idKey)
        val leafKey = leafEdge.optString(end.leafKey)
        if (nodeId !in fileNodeIds) return listOf("leaf edge with unknown ${end.idKey} '$nodeId'")
        if (leaves == null || leaves.isEmpty) return emptyList()
        val isDeclared = leaves.optJSONObject(nodeId)?.has(leafKey) == true
        return if (isDeclared) emptyList() else listOf("leaf edge with unknown ${end.leafKey} '$leafKey'")
    }

    private fun collectNodeIds(fileNode: JSONObject, nodeIds: MutableSet<String>, fileNodeIds: MutableSet<String>) {
        val id = fileNode.getString("id")
        nodeIds.add(id)
        if (fileNode.optString("type") == NodeType.File.name) fileNodeIds.add(id)
        val children: JSONArray = fileNode.optJSONArray("children") ?: return
        for (index in 0 until children.length()) {
            collectNodeIds(children.getJSONObject(index), nodeIds, fileNodeIds)
        }
    }

    private enum class LeafEdgeEnd(val idKey: String, val leafKey: String) {
        FROM("fromId", "fromLeaf"),
        TO("toId", "toLeaf")
    }

    companion object {
        private const val LEAVES_KEY = "leaves"
        private const val NAMESPACES_KEY = "namespaces"
        private const val NAMESPACE_KEY = "namespace"
        private const val PARENT_KEY = "parent"
    }
}
