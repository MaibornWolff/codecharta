package de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities

import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.QS
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.Bom
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.BomRating
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.BomTool
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.BomVulnerability
import de.maibornwolff.codecharta.analysers.importers.sbom.packages.PackageCatalog
import de.maibornwolff.codecharta.model.SecurityVulnerability
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class EmbeddedVulnerabilitiesTest {
    @Test
    fun `should file a vulnerability under every package it affects with its v3 rating and fixed versions`() {
        // Arrange
        val bom = TestBoms.trivy()

        // Act
        val byPackage = EmbeddedVulnerabilities.byPackage(bom, PackageCatalog.of(bom).keyByRef)

        // Assert
        assertThat(byPackage.keys).containsExactly(QS)
        assertThat(byPackage.getValue(QS))
            .containsExactly(SecurityVulnerability("CVE-2022-24999", Severity.HIGH, 7.5, listOf("6.5.3", "6.10.3"), "ghsa"))
    }

    @Test
    fun `should name a known scanner only when the SBOM carries a vulnerability list`() {
        // Arrange
        val scanned = bomWith(listOf(BomTool("trivy", "0.76.1")), hasVulnerabilityList = true)
        val notScanned = bomWith(listOf(BomTool("trivy", "0.76.1")), hasVulnerabilityList = false)
        val unknownTool = bomWith(listOf(BomTool("cdxgen", "11.0.0")), hasVulnerabilityList = true)

        // Act
        val scanners = listOf(scanned, notScanned, unknownTool).map { EmbeddedVulnerabilities.scannerOf(it) }

        // Assert
        assertThat(scanners).containsExactly("trivy 0.76.1", null, null)
    }

    @Test
    fun `should ignore CVSS v2 and compute a v3 score from its vector when the rating gives none`() {
        // Arrange
        val ratings = listOf(
            BomRating(10.0, null, "CVSSv2", "AV:N/AC:L/Au:N/C:C/I:C/A:C"),
            BomRating(null, null, null, "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H")
        )
        val bom = bomWith(emptyList(), true, listOf(BomVulnerability("CVE-1", null, ratings, listOf(QS), emptyList())))

        // Act
        val vulnerability = EmbeddedVulnerabilities.byPackage(bom, mapOf("other" to QS)).getValue(QS).single()

        // Assert
        assertThat(vulnerability.score).isEqualTo(7.5)
        assertThat(vulnerability.severity).isEqualTo(Severity.HIGH)
        assertThat(vulnerability.fixedVersions).isNull()
    }

    @Test
    fun `should skip an affected ref the SBOM does not list`() {
        // Arrange
        val bom = bomWith(emptyList(), true, listOf(BomVulnerability("CVE-1", null, emptyList(), listOf("ghost"), emptyList())))

        // Act
        val byPackage = EmbeddedVulnerabilities.byPackage(bom, mapOf("qs-ref" to QS))

        // Assert
        assertThat(byPackage).isEmpty()
    }

    private fun bomWith(tools: List<BomTool>, hasVulnerabilityList: Boolean, vulnerabilities: List<BomVulnerability> = emptyList()) =
        Bom(tools, hasVulnerabilityList, null, emptyList(), emptyMap(), vulnerabilities)
}
