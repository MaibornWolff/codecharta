package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.federation

import com.google.gson.Gson
import com.google.gson.JsonParser
import com.google.gson.Strictness
import com.google.gson.stream.JsonReader
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.io.StringReader

/**
 * Parses package.json files to extract Module Federation configuration.
 */
object FederationConfigParser {
    private val gson = Gson()

    fun parse(packageJsonFile: File): FederationConfigData? {
        if (!packageJsonFile.exists()) return null

        return runCatching {
            val reader = JsonReader(StringReader(packageJsonFile.readText()))
            reader.strictness = Strictness.LENIENT
            gson
                .fromJson(JsonParser.parseReader(reader), PackageJsonData::class.java)
                ?.federation
                ?.toFederationConfigData()
        }.onFailure { failure ->
            Logger.warn { "Could not parse ${packageJsonFile.path} (${failure.message}); the federation remotes it defines are ignored" }
        }.getOrNull()
    }
}

private class PackageJsonData(val name: String? = null, val federation: FederationField? = null)

private class FederationField(
    val name: String? = null,
    val remotes: Map<String, String>? = null,
    val exposes: Map<String, String>? = null
) {
    fun toFederationConfigData(): FederationConfigData = FederationConfigData(
        name = name,
        remotes = remotes ?: emptyMap(),
        exposes = exposes ?: emptyMap()
    )
}
