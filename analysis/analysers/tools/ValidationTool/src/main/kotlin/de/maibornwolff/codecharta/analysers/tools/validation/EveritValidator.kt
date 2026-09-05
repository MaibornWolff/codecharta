package de.maibornwolff.codecharta.analysers.tools.validation

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
        if (major != ApiVersion.TWO_ZERO.major.toString() && looksLegacy) {
            throw LegacyFileException(LegacyFileException.CONVERT_HINT)
        }
    }

    private fun checkReferentialIntegrity(json: JSONObject) {
        val files = json.optJSONArray("files") ?: return
        val nodeIds = HashSet<String>()
        for (index in 0 until files.length()) {
            collectNodeIds(files.getJSONObject(index), nodeIds)
        }

        val lenses = json.optJSONObject("lenses") ?: return
        val danglingReferences = mutableListOf<String>()

        lenses.optJSONObject("metrics")?.optJSONObject("attributes")?.keySet()?.forEach { nodeId ->
            if (nodeId !in nodeIds) {
                danglingReferences.add("metrics-lens entry for unknown node id '$nodeId'")
            }
        }

        val dependency = lenses.optJSONObject("dependency")

        dependency?.optJSONArray("edges")?.let { edges ->
            for (index in 0 until edges.length()) {
                val edge = edges.getJSONObject(index)
                val fromId = edge.optString("fromId")
                val toId = edge.optString("toId")
                if (fromId !in nodeIds) danglingReferences.add("edge with unknown fromId '$fromId'")
                if (toId !in nodeIds) danglingReferences.add("edge with unknown toId '$toId'")
            }
        }

        dependency?.optJSONObject("nodes")?.keySet()?.forEach { nodeId ->
            if (nodeId !in nodeIds) danglingReferences.add("dependency-lens node entry for unknown node id '$nodeId'")
        }

        // A leaf joins the logical layer onto the file tree through its nodeId, the only node reference the
        // logical tables carry; one that resolves to nothing would be dropped silently on read.
        val leaves = dependency?.optJSONObject("leaves")
        leaves?.keySet()?.forEach { leafId ->
            val nodeId = leaves.getJSONObject(leafId).optString("nodeId")
            if (nodeId !in nodeIds) {
                danglingReferences.add("dependency-lens leaf '$leafId' with unknown nodeId '$nodeId'")
            }
        }

        // Leaf edges address leaves; without a leaf table there are no endpoints to check them against.
        val leafIds = leaves?.keySet().orEmpty()
        dependency?.optJSONArray("leafEdges")?.takeIf { leafIds.isNotEmpty() }?.let { leafEdges ->
            for (index in 0 until leafEdges.length()) {
                val leafEdge = leafEdges.getJSONObject(index)
                val fromLeaf = leafEdge.optString("fromLeaf")
                val toLeaf = leafEdge.optString("toLeaf")
                if (fromLeaf !in leafIds) danglingReferences.add("leaf edge with unknown fromLeaf '$fromLeaf'")
                if (toLeaf !in leafIds) danglingReferences.add("leaf edge with unknown toLeaf '$toLeaf'")
            }
        }

        if (danglingReferences.isNotEmpty()) {
            throw ReferentialIntegrityException(
                "This cc.json has references that do not resolve to a node id or leaf it declares: " +
                    danglingReferences.joinToString("; ") + "."
            )
        }
    }

    private fun collectNodeIds(fileNode: JSONObject, nodeIds: MutableSet<String>) {
        nodeIds.add(fileNode.getString("id"))
        val children: JSONArray = fileNode.optJSONArray("children") ?: return
        for (index in 0 until children.length()) {
            collectNodeIds(children.getJSONObject(index), nodeIds)
        }
    }
}
