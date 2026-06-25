package de.maibornwolff.codecharta.analysers.tools.validation

import de.maibornwolff.codecharta.serialization.CompressedStreamHandler
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
        schema.validate(JSONObject(JSONTokener(content)))
        content.close()
    }
}
