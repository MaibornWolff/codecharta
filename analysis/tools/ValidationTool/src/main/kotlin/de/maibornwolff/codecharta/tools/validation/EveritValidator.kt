package de.maibornwolff.codecharta.tools.validation

import org.everit.json.schema.Schema
import org.everit.json.schema.loader.SchemaLoader
import org.json.JSONException
import org.json.JSONObject
import org.json.JSONTokener
import java.io.BufferedInputStream
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
        var content = input
        if (!input.markSupported()) content = BufferedInputStream(input)

        content.mark(2)
        val fileHeader = content.readNBytes(2)
        content.reset()
        if (fileHeader.isEmpty()) {
            throw JSONException("Empty file found!")
        }
        if (isGzipSteam(fileHeader)) {
            schema.validate(JSONObject(JSONTokener(GZIPInputStream(content))))
        } else {
            schema.validate(JSONObject(JSONTokener(content)))
        }
        content.close()
    }

    private fun isGzipSteam(bytes: ByteArray): Boolean {
        return bytes[0] == (GZIPInputStream.GZIP_MAGIC.toByte()) && bytes[1] == (GZIPInputStream.GZIP_MAGIC ushr 8).toByte()
    }
}
