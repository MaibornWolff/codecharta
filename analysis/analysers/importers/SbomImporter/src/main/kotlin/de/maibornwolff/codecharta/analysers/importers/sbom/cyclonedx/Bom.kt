package de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx

/** The parts of a CycloneDX document the importer reads; everything else is ignored. */
data class Bom(
    val tools: List<BomTool>,
    val hasVulnerabilityList: Boolean,
    val rootRef: String?,
    val components: List<BomComponent>,
    val dependsOn: Map<String, List<String>>,
    val vulnerabilities: List<BomVulnerability>
)

data class BomTool(val name: String, val version: String?) {
    val label: String get() = listOfNotNull(name, version).joinToString(" ")
}

data class BomComponent(
    val ref: String,
    val type: String,
    val name: String,
    val group: String?,
    val version: String?,
    val purl: String?,
    val properties: Map<String, String>
)

data class BomVulnerability(
    val id: String,
    val source: String?,
    val ratings: List<BomRating>,
    val affectedRefs: List<String>,
    val fixedVersions: List<String>
)

data class BomRating(val score: Double?, val severity: String?, val method: String?, val vector: String?)
