package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.util.Logger
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
        // The caller reads this count to warn that 1.x curation is dropped by the 2.0 conversion, so a
        // silent 0 would claim "none to drop" when the truth is "could not tell" — the exact data loss
        // this inspector exists to announce. Warn instead; the conversion itself stays unaffected.
        Logger.warn {
            "Could not inspect the source file for markedPackages: ${e.message}. " +
                "Any marked packages it carries are dropped from the converted output without further notice."
        }
        0
    }
}
