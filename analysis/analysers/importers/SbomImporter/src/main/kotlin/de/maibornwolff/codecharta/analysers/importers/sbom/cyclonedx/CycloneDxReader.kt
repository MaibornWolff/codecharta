package de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import java.io.File
import java.io.Reader

/** Reads a CycloneDX JSON document (spec 1.4 to 1.7) into a [Bom]; nested components are flattened. */
object CycloneDxReader {
    private const val UNNAMED = "unnamed"
    private const val RECOMMENDED_VERSIONS = "to version"
    private const val UNAFFECTED = "unaffected"

    fun read(file: File): Bom = file.bufferedReader().use(::read)

    fun read(reader: Reader): Bom {
        val document = JsonParser.parseReader(reader)
        require(document.isJsonObject && document.asJsonObject.string("bomFormat") == "CycloneDX") {
            "The input is not a CycloneDX JSON document."
        }
        return toBom(document.asJsonObject)
    }

    private fun toBom(document: JsonObject): Bom {
        val metadata = document.objectOrNull("metadata")
        return Bom(
            tools = readTools(metadata?.get("tools")),
            hasVulnerabilityList = document.has("vulnerabilities"),
            rootRef = metadata?.objectOrNull("component")?.string("bom-ref"),
            components = flattenComponents(document.arrayOrEmpty("components")),
            dependsOn = readDependencies(document.arrayOrEmpty("dependencies")),
            vulnerabilities = document.arrayOrEmpty("vulnerabilities").objects().mapNotNull(::readVulnerability)
        )
    }

    // CycloneDX 1.5 moved the tools into `tools.components` and `tools.services`; 1.4 lists them as an array.
    private fun readTools(tools: JsonElement?): List<BomTool> {
        val entries = when {
            tools == null -> emptyList()
            tools.isJsonArray -> tools.asJsonArray.objects()
            tools.isJsonObject -> tools.asJsonObject.arrayOrEmpty("components").objects() +
                tools.asJsonObject.arrayOrEmpty("services").objects()
            else -> emptyList()
        }
        return entries.mapNotNull { tool -> tool.string("name")?.let { BomTool(it, tool.string("version")) } }
    }

    private fun flattenComponents(components: JsonArray): List<BomComponent> = components.objects().flatMap { component ->
        listOfNotNull(readComponent(component)) + flattenComponents(component.arrayOrEmpty("components"))
    }

    private fun readComponent(component: JsonObject): BomComponent? {
        val purl = component.string("purl")
        val name = component.string("name") ?: UNNAMED
        val version = component.string("version")
        val ref = component.string("bom-ref") ?: purl ?: "$name@${version.orEmpty()}"
        return BomComponent(
            ref = ref,
            type = component.string("type") ?: "library",
            name = name,
            group = component.string("group"),
            version = version,
            purl = purl,
            properties = component.arrayOrEmpty("properties").objects().mapNotNull(::readProperty).toMap()
        )
    }

    private fun readProperty(property: JsonObject): Pair<String, String>? {
        val name = property.string("name") ?: return null
        val value = property.string("value") ?: return null
        return name to value
    }

    private fun readDependencies(dependencies: JsonArray): Map<String, List<String>> = dependencies
        .objects()
        .mapNotNull { dependency -> dependency.string("ref")?.let { it to dependency.arrayOrEmpty("dependsOn").strings() } }
        .groupBy({ it.first }, { it.second })
        .mapValues { (_, lists) -> lists.flatten().distinct() }

    private fun readVulnerability(vulnerability: JsonObject): BomVulnerability? {
        val id = vulnerability.string("id") ?: return null
        val affects = vulnerability.arrayOrEmpty("affects").objects()
        return BomVulnerability(
            id = id,
            source = vulnerability.objectOrNull("source")?.string("name"),
            ratings = vulnerability.arrayOrEmpty("ratings").objects().map(::readRating),
            affectedRefs = affects.mapNotNull { it.string("ref") },
            fixedVersions = (unaffectedVersions(affects) + recommendedVersions(vulnerability.string("recommendation"))).distinct()
        )
    }

    private fun readRating(rating: JsonObject): BomRating = BomRating(
        score = rating.get("score")?.takeIf { it.isJsonPrimitive && it.asJsonPrimitive.isNumber }?.asDouble,
        severity = rating.string("severity"),
        method = rating.string("method"),
        vector = rating.string("vector")
    )

    private fun unaffectedVersions(affects: List<JsonObject>): List<String> = affects
        .flatMap { it.arrayOrEmpty("versions").objects() }
        .filter { it.string("status") == UNAFFECTED }
        .mapNotNull { it.string("version") }

    // Trivy names the fixed versions only in its recommendation, e.g. "Upgrade undici to version 7.30.1, 8.12.2"
    private fun recommendedVersions(recommendation: String?): List<String> {
        val versions = recommendation?.substringAfter(RECOMMENDED_VERSIONS, "")?.trim().orEmpty()
        return versions.split(",").map { it.trim() }.filter { it.isNotEmpty() }
    }

    private fun JsonObject.string(key: String): String? = get(key)?.takeIf { it.isJsonPrimitive }?.asString

    private fun JsonObject.objectOrNull(key: String): JsonObject? = get(key)?.takeIf { it.isJsonObject }?.asJsonObject

    private fun JsonObject.arrayOrEmpty(key: String): JsonArray = get(key)?.takeIf { it.isJsonArray }?.asJsonArray ?: JsonArray()

    private fun JsonArray.objects(): List<JsonObject> = filter { it.isJsonObject }.map { it.asJsonObject }

    private fun JsonArray.strings(): List<String> = filter { it.isJsonPrimitive }.map { it.asString }
}
