package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.util.Logger
import java.io.InputStream

object LegacyCurationInspector {
    fun countMarkedPackages(input: InputStream): Int = try {
        val text = CompressedStreamHandler.wrapInput(input).bufferedReader().use { it.readText() }
        val root = JsonParser.parseString(text).asJsonObject
        val holder = root.get("data")?.takeIf { it.isJsonObject }?.asJsonObject ?: root
        holder.get("markedPackages")?.takeIf { it.isJsonArray }?.asJsonArray?.size() ?: 0
    } catch (e: Exception) {
        // Silent 0 would falsely claim "none to drop" when the real answer is "could not tell" — warn instead.
        Logger.warn {
            "Could not inspect the source file for markedPackages: ${e.message}. " +
                "Any marked packages it carries are dropped from the converted output without further notice."
        }
        0
    }
}
