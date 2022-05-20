package de.maibornwolff.codecharta.tools.validation

import org.everit.json.schema.Schema
import org.everit.json.schema.loader.SchemaLoader
import org.json.JSONException
import org.json.JSONObject
import org.json.JSONTokener
import java.io.InputStream
import java.util.zip.GZIPInputStream

class EveritValidator(private var schemaPath: String) : Validator {
    private var schema = loadSchema()

    private fun loadSchema(): Schema {
        val input = this.javaClass.classLoader.getResourceAsStream(schemaPath)
        val rawJson = JSONObject(JSONTokener(input))
        return SchemaLoader.load(rawJson)
    }

    override fun validate(input: InputStream) {
        var content = input.readNBytes(2)

        if (content.isEmpty()) {
            throw JSONException("Empty file found!")
        }
        content += input.readBytes()
        input.close()
        if (isGzipSteam(content)) {
            schema.validate(JSONObject(JSONTokener(GZIPInputStream(content.inputStream()))))
        } else {
            schema.validate(JSONObject(JSONTokener(String(content))))
        }
    }

    private fun isGzipSteam(bytes: ByteArray): Boolean {
        return bytes[0] == (GZIPInputStream.GZIP_MAGIC.toByte()) && bytes[1] == (GZIPInputStream.GZIP_MAGIC ushr 8).toByte()
    }
}
