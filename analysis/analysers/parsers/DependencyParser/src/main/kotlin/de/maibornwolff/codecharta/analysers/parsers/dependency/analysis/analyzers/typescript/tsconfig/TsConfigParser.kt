package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig

import com.google.gson.Gson
import com.google.gson.JsonParser
import com.google.gson.Strictness
import com.google.gson.stream.JsonReader
import java.io.File
import java.io.StringReader

object TsConfigParser {
    private val gson = Gson()

    /**
     * A `tsconfig.json` is JSON with comments and trailing commas, which strict JSON rejects; GSON's
     * lenient reader accepts both. A file that still fails to parse yields null, so the caller falls
     * back to leaving the import unresolved rather than aborting the analysis.
     */
    fun parse(tsconfigFile: File): TsConfigData? {
        if (!tsconfigFile.exists()) return null

        return runCatching {
            val reader = JsonReader(StringReader(tsconfigFile.readText()))
            reader.strictness = Strictness.LENIENT
            gson.fromJson<TsConfigData>(JsonParser.parseReader(reader), TsConfigData::class.java)
        }.getOrNull()
    }
}
