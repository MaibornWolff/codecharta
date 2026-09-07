package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig

import com.google.gson.Gson
import com.google.gson.JsonParser
import com.google.gson.Strictness
import com.google.gson.stream.JsonReader
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.io.StringReader

object TsConfigParser {
    private val gson = Gson()

    /**
     * A `tsconfig.json` may carry comments, which GSON's lenient reader accepts. A trailing comma in an
     * object still fails the parse (yielding null and a warning, so the caller leaves the import unresolved
     * rather than aborting the analysis), while one in a `paths` array reads as a null element, which is dropped.
     */
    fun parse(tsconfigFile: File): TsConfigData? {
        if (!tsconfigFile.exists()) return null

        return runCatching {
            val reader = JsonReader(StringReader(tsconfigFile.readText()))
            reader.strictness = Strictness.LENIENT
            gson.fromJson<TsConfigData>(JsonParser.parseReader(reader), TsConfigData::class.java).withoutNullPathTargets()
        }.onFailure { failure ->
            Logger.warn { "Could not parse ${tsconfigFile.path} (${failure.message}); the path aliases it defines are ignored" }
        }.getOrNull()
    }

    private fun TsConfigData.withoutNullPathTargets(): TsConfigData {
        val options = compilerOptions ?: return this
        val paths = options.paths ?: return this
        return copy(compilerOptions = options.copy(paths = paths.mapValues { (_, targets) -> targets.filterNotNull() }))
    }
}
