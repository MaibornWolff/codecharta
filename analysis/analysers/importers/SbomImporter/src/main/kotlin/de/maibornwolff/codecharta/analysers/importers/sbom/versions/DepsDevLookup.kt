package de.maibornwolff.codecharta.analysers.importers.sbom.versions

import com.google.gson.JsonObject
import com.google.gson.JsonParser
import de.maibornwolff.codecharta.analysers.importers.sbom.http.HttpGateway
import de.maibornwolff.codecharta.analysers.importers.sbom.parallel.inParallel
import de.maibornwolff.codecharta.model.SecurityPackage
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.time.LocalDate
import java.time.OffsetDateTime

data class DepsDevResult(val lags: Map<String, Lag>, val unsupported: Set<String>, val notFound: Set<String>, val failed: Set<String>)

/** Looks up every version of each package on deps.dev, once per package name, and measures each used version's lag. */
class DepsDevLookup(private val http: HttpGateway, private val baseUrl: String = BASE_URL) {
    fun lookUp(packages: Map<String, SecurityPackage>, lookupDate: LocalDate): DepsDevResult {
        val (supported, unsupported) = packages.entries.partition { systemOf(it.value) != null && it.value.version != null }
        val namesToFetch = supported.map { PackageName(systemOf(it.value)!!, it.value.name) }.distinct().sortedBy { it.toString() }
        val versionsByName = namesToFetch.inParallel { name -> name to runCatching { fetchVersions(name) } }.toMap()
        val outcomes = supported.associate { (key, securityPackage) ->
            key to versionsByName.getValue(PackageName(systemOf(securityPackage)!!, securityPackage.name))
        }
        return DepsDevResult(
            lags = outcomes
                .mapNotNull { (key, outcome) -> outcome.getOrNull()?.let { key to lagOf(packages.getValue(key), it, lookupDate) } }
                .toMap()
                .toSortedMap(),
            unsupported = unsupported.map { it.key }.toSet(),
            notFound = outcomes.filterValues { it.isSuccess && it.getOrNull() == null }.keys,
            failed = outcomes.filterValues { it.isFailure }.keys
        )
    }

    private fun lagOf(securityPackage: SecurityPackage, published: List<PublishedVersion>, lookupDate: LocalDate): Lag =
        VersionLag.of(securityPackage.version!!, securityPackage.ecosystem, published, lookupDate)

    private fun fetchVersions(name: PackageName): List<PublishedVersion>? {
        val reply = http.get("$baseUrl/v3/systems/${name.system}/packages/${encode(name.name)}")
        if (reply.isNotFound) return null
        check(reply.isSuccess) { "deps.dev answered HTTP ${reply.status} for ${name.name}" }
        return JsonParser
            .parseString(reply.body)
            .asJsonObject
            .getAsJsonArray("versions")
            ?.map { toPublishedVersion(it.asJsonObject) }
            .orEmpty()
    }

    private fun toPublishedVersion(version: JsonObject): PublishedVersion = PublishedVersion(
        version = version.getAsJsonObject("versionKey").get("version").asString,
        publishedAt = version.get("publishedAt")?.takeIf { it.isJsonPrimitive }?.asString?.let { OffsetDateTime.parse(it).toLocalDate() }
    )

    private fun systemOf(securityPackage: SecurityPackage): String? = SYSTEM_BY_ECOSYSTEM[securityPackage.ecosystem]

    private fun encode(name: String): String = URLEncoder.encode(name, StandardCharsets.UTF_8).replace("+", "%20")

    private data class PackageName(val system: String, val name: String) {
        override fun toString(): String = "$system/$name"
    }

    companion object {
        const val SOURCE = "deps.dev"
        private const val BASE_URL = "https://api.deps.dev"
        private val SYSTEM_BY_ECOSYSTEM = mapOf(
            "npm" to "NPM",
            "maven" to "MAVEN",
            "pypi" to "PYPI",
            "golang" to "GO",
            "cargo" to "CARGO",
            "nuget" to "NUGET",
            "gem" to "RUBYGEMS"
        )
    }
}
