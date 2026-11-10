package de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities

import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.Bom
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.BomRating
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.BomVulnerability
import de.maibornwolff.codecharta.analysers.importers.sbom.packages.Purl
import de.maibornwolff.codecharta.model.SecurityVulnerability

/** The vulnerabilities a scanner wrote into the SBOM, per package key; an affected ref the SBOM does not know is skipped. */
object EmbeddedVulnerabilities {
    private const val V2_METHOD = "CVSSv2"
    private val KNOWN_SCANNERS = listOf("trivy", "grype", "snyk", "osv-scanner", "scout")

    /** The scanner that checked every package, when the SBOM names one and carries a vulnerability list. */
    fun scannerOf(bom: Bom): String? {
        if (!bom.hasVulnerabilityList) return null
        return bom.tools.firstOrNull { tool -> KNOWN_SCANNERS.any { tool.name.lowercase().contains(it) } }?.label
    }

    fun byPackage(bom: Bom, keyByRef: Map<String, String>): Map<String, List<SecurityVulnerability>> {
        val knownKeys = keyByRef.values.toSet()
        return bom.vulnerabilities
            .flatMap { vulnerability ->
                val converted = convert(vulnerability)
                vulnerability.affectedRefs.mapNotNull { ref -> keyOf(ref, keyByRef, knownKeys)?.let { it to converted } }
            }.groupBy({ it.first }, { it.second })
            .mapValues { (_, vulnerabilities) -> vulnerabilities.distinctBy { it.id }.sortedBy { it.id } }
    }

    private fun keyOf(ref: String, keyByRef: Map<String, String>, knownKeys: Set<String>): String? =
        keyByRef[ref] ?: Purl.parse(ref)?.key?.takeIf { it in knownKeys }

    private fun convert(vulnerability: BomVulnerability): SecurityVulnerability {
        val rating = rate(vulnerability.ratings)
        return SecurityVulnerability(
            id = vulnerability.id,
            severity = rating.severity,
            score = rating.score,
            fixedVersions = vulnerability.fixedVersions.ifEmpty { null },
            source = vulnerability.source
        )
    }

    private fun rate(ratings: List<BomRating>): Rating {
        val (v3Ratings, otherRatings) = ratings.partition { CvssV3.isV3(it.vector) || it.method?.startsWith("CVSSv3") == true }
        val v3Scores = v3Ratings.mapNotNull { it.score ?: it.vector?.let(CvssV3::baseScore) }
        val otherScores = otherRatings.filter { it.method != V2_METHOD && !isV2Vector(it.vector) }.mapNotNull { it.score }
        return Severity.rate(v3Scores, otherScores, ratings.mapNotNull { it.severity })
    }

    private fun isV2Vector(vector: String?): Boolean = vector != null && (vector.startsWith("AV:") || vector.startsWith("CVSS:2"))
}
