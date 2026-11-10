package de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities

import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import de.maibornwolff.codecharta.analysers.importers.sbom.http.HttpGateway
import de.maibornwolff.codecharta.analysers.importers.sbom.packages.Purl
import de.maibornwolff.codecharta.analysers.importers.sbom.parallel.inParallel
import de.maibornwolff.codecharta.model.SecurityVulnerability

data class OsvResult(val vulnerabilities: Map<String, List<SecurityVulnerability>>, val unchecked: Set<String>)

/** Asks OSV.dev which known vulnerabilities affect the given packages: one batch query, then the details of each hit. */
class OsvLookup(private val http: HttpGateway, private val baseUrl: String = BASE_URL) {
    fun check(packageKeys: Collection<String>): OsvResult {
        val (queryable, unqueryable) = packageKeys.distinct().sorted().partition { Purl.parse(it)?.version != null }
        val batches = queryable.chunked(BATCH_SIZE)
        val hits = batches.map(::queryBatch)
        val idsByKey = hits.mapNotNull { it.getOrNull() }.fold(emptyMap<String, List<String>>()) { all, batch -> all + batch }
        val failedKeys = batches.zip(hits).filter { it.second.isFailure }.flatMap { it.first }
        val details = idsByKey.values
            .flatten()
            .distinct()
            .inParallel { id -> id to fetchDetails(id) }
            .toMap()
        val vulnerabilities = idsByKey
            .mapValues { (key, ids) -> ids.map { toVulnerability(it, details[it], key) }.distinctBy { it.id }.sortedBy { it.id } }
            .filterValues { it.isNotEmpty() }
        return OsvResult(vulnerabilities, (unqueryable + failedKeys).toSet())
    }

    private fun queryBatch(keys: List<String>): Result<Map<String, List<String>>> = runCatching {
        val queries = JsonArray().apply { keys.forEach { add(query(it, null)) } }
        val results = postJson("$baseUrl/v1/querybatch", JsonObject().apply { add("queries", queries) }).getAsJsonArray("results")
        keys.zip(results.map { it.asJsonObject }).associate { (key, result) -> key to (idsOf(result) + nextPages(key, result)) }
    }

    private fun nextPages(key: String, firstPage: JsonObject): List<String> {
        val ids = mutableListOf<String>()
        var token = firstPage.string("next_page_token")
        while (token != null) {
            val page = postJson(
                "$baseUrl/v1/querybatch",
                JsonObject().apply { add("queries", JsonArray().apply { add(query(key, token)) }) }
            ).getAsJsonArray("results")
                .first()
                .asJsonObject
            ids += idsOf(page)
            token = page.string("next_page_token")
        }
        return ids
    }

    private fun query(key: String, pageToken: String?): JsonObject = JsonObject().apply {
        add("package", JsonObject().apply { addProperty("purl", key) })
        pageToken?.let { addProperty("page_token", it) }
    }

    private fun idsOf(result: JsonObject): List<String> = result.arrayOrEmpty("vulns").mapNotNull { it.asJsonObject.string("id") }

    private fun fetchDetails(id: String): JsonObject? = runCatching {
        val reply = http.get("$baseUrl/v1/vulns/$id")
        if (reply.isSuccess) JsonParser.parseString(reply.body).asJsonObject else null
    }.getOrNull()

    private fun postJson(url: String, body: JsonObject): JsonObject {
        val reply = http.post(url, body.toString())
        check(reply.isSuccess) { "$url answered HTTP ${reply.status}" }
        return JsonParser.parseString(reply.body).asJsonObject
    }

    private fun toVulnerability(osvId: String, details: JsonObject?, packageKey: String): SecurityVulnerability {
        if (details == null) return SecurityVulnerability(osvId, Severity.UNKNOWN, source = SOURCE)
        val rating = rate(details)
        return SecurityVulnerability(
            id = preferredId(osvId, details),
            severity = rating.severity,
            score = rating.score,
            fixedVersions = fixedVersions(details, packageKey).ifEmpty { null },
            source = SOURCE
        )
    }

    private fun preferredId(osvId: String, details: JsonObject): String =
        details.arrayOrEmpty("aliases").map { it.asString }.filter { it.startsWith("CVE-") }.minOrNull() ?: osvId

    private fun rate(details: JsonObject): Rating {
        val vectors = details.arrayOrEmpty("severity").mapNotNull { it.asJsonObject.string("score") }
        val labels = (listOf(details) + details.arrayOrEmpty("affected").map { it.asJsonObject })
            .mapNotNull { it.getAsJsonObject("database_specific")?.string("severity") }
        return Severity.rate(vectors.mapNotNull(CvssV3::baseScore), emptyList(), labels)
    }

    private fun fixedVersions(details: JsonObject, packageKey: String): List<String> {
        val purlWithoutVersion = Purl.parse(packageKey)?.copy(version = null)?.key
        return details
            .arrayOrEmpty("affected")
            .map { it.asJsonObject }
            .filter { affected ->
                affected.getAsJsonObject("package")?.string("purl")?.let { Purl.parse(it)?.copy(version = null)?.key } ==
                    purlWithoutVersion
            }.flatMap { it.arrayOrEmpty("ranges") }
            .flatMap { it.asJsonObject.arrayOrEmpty("events") }
            .mapNotNull { it.asJsonObject.string("fixed") }
            .distinct()
    }

    private fun JsonObject.string(key: String): String? = get(key)?.takeIf { it.isJsonPrimitive }?.asString

    private fun JsonObject.arrayOrEmpty(key: String): JsonArray = get(key)?.takeIf { it.isJsonArray }?.asJsonArray ?: JsonArray()

    companion object {
        const val SOURCE = "osv"
        private const val BASE_URL = "https://api.osv.dev"
        private const val BATCH_SIZE = 1000
    }
}
