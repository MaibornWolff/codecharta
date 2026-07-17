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

        lenses.optJSONObject("dependency")?.optJSONArray("edges")?.let { edges ->
            for (index in 0 until edges.length()) {
                val edge = edges.getJSONObject(index)
                val fromId = edge.optString("fromId")
                val toId = edge.optString("toId")
                if (fromId !in nodeIds) danglingReferences.add("edge with unknown fromId '$fromId'")
                if (toId !in nodeIds) danglingReferences.add("edge with unknown toId '$toId'")
            }
        }

        if (danglingReferences.isNotEmpty()) {
            throw ReferentialIntegrityException(
                "This cc.json has references that do not resolve to a file-tree node id: " +
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
