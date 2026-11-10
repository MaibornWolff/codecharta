package de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import java.io.File

class CycloneDxReaderTest {
    @Test
    fun `should read the tools a CycloneDX 1_5 document lists under tools components`() {
        // Arrange
        val document = File("src/test/resources/trivy_sample.cdx.json")

        // Act
        val bom = document.bufferedReader().use { CycloneDxReader.read(it) }

        // Assert
        assertThat(bom.tools).containsExactly(BomTool("trivy", "0.76.1"))
        assertThat(bom.hasVulnerabilityList).isTrue()
        assertThat(bom.rootRef).isEqualTo("root")
    }

    @Test
    fun `should read the tools of a CycloneDX 1_4 array and flatten nested components`() {
        // Arrange
        val document = File("src/test/resources/cdxgen_sample.cdx.json")

        // Act
        val bom = document.bufferedReader().use { CycloneDxReader.read(it) }

        // Assert
        assertThat(bom.tools.map { it.label }).containsExactly("cdxgen 11.0.0")
        assertThat(bom.components.map { it.name }).containsExactly("express", "qs")
        assertThat(bom.components.first().properties).containsEntry("SrcFile", "/build/shop/package-lock.json")
        assertThat(bom.hasVulnerabilityList).isFalse()
    }

    @Test
    fun `should take the fixed versions from the recommendation and from unaffected versions`() {
        // Arrange
        val document =
            """{"bomFormat":"CycloneDX","vulnerabilities":[{"id":"CVE-1","recommendation":"Upgrade qs to version 6.5.3, 6.10.3",""" +
                """"affects":[{"ref":"qs","versions":[{"version":"6.11.0","status":"unaffected"},{"version":"6.5.2","status":"affected"}]}]}]}"""

        // Act
        val vulnerability = CycloneDxReader.read(document.reader()).vulnerabilities.single()

        // Assert
        assertThat(vulnerability.fixedVersions).containsExactly("6.11.0", "6.5.3", "6.10.3")
        assertThat(vulnerability.affectedRefs).containsExactly("qs")
    }

    @Test
    fun `should merge the dependency lists a document gives twice for one ref`() {
        // Arrange
        val document =
            """{"bomFormat":"CycloneDX","dependencies":[{"ref":"a","dependsOn":["b"]},{"ref":"a","dependsOn":["c","b"]}]}"""

        // Act
        val bom = CycloneDxReader.read(document.reader())

        // Assert
        assertThat(bom.dependsOn).containsEntry("a", listOf("b", "c"))
    }

    @Test
    fun `should reject a document that is not CycloneDX`() {
        // Arrange
        val spdx = """{"spdxVersion":"SPDX-2.3"}"""

        // Act + Assert
        assertThatThrownBy { CycloneDxReader.read(spdx.reader()) }.hasMessageContaining("not a CycloneDX")
    }
}
