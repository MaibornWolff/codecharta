package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonParser
import java.io.InputStream

/**
 * Reports 1.x-only visualization view state that the cc.json 2.0 format does not carry, so `ccsh
 * convert` can warn that this curation is dropped. `markedPackages` is not part of the domain model
 * (it is discarded when a 1.x file is read), so it is detected here from the raw source — handling
 * gzip and the wrapped `{ checksum, data: … }` envelope.
 */
object LegacyCurationInspector {
    fun countMarkedPackages(input: InputStream): Int = try {
        val text = CompressedStreamHandler.wrapInput(input).bufferedReader().use { it.readText() }
        val root = JsonParser.parseString(text).asJsonObject
        val holder = root.get("data")?.takeIf { it.isJsonObject }?.asJsonObject ?: root
        holder.get("markedPackages")?.takeIf { it.isJsonArray }?.asJsonArray?.size() ?: 0
    } catch (e: Exception) {
        0
    }
}
