package de.maibornwolff.codecharta.analysers.tools.validation

import de.maibornwolff.codecharta.serialization.ApiVersion
import de.maibornwolff.codecharta.serialization.CompressedStreamHandler
import de.maibornwolff.codecharta.serialization.LegacyFileException
import org.everit.json.schema.Schema
import org.everit.json.schema.loader.SchemaLoader
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
    }

    /**
     * `ccsh check` bypasses [de.maibornwolff.codecharta.serialization.ProjectDeserializer], so without this
     * gate a legacy 1.x file would either pass (the bundled schema still accepts the wrapped 1.x shape) or
     * fail with an opaque schema stack trace — inconsistent with every other command, which points the user
     * at `ccsh convert`. Mirrors ProjectDeserializer's version detection so only a genuine 1.x file is
     * rejected with the convert hint; unrelated malformed 2.0 input still falls through to schema validation.
     */
    private fun rejectLegacyDocument(json: JSONObject) {
        val metaApiVersion = json.optJSONObject("meta")?.optString("apiVersion")?.takeIf { it.isNotBlank() }
        val major = metaApiVersion?.substringBefore('.') ?: if (json.has("lenses")) "2" else "1"
        val looksLegacy = json.has("nodes") || json.optJSONObject("data") != null || json.has("apiVersion")
        if (major != ApiVersion.TWO_ZERO.major.toString() && looksLegacy) {
            throw LegacyFileException(LegacyFileException.CONVERT_HINT)
        }
    }
}
