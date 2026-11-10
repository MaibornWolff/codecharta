package de.maibornwolff.codecharta.analysers.importers.sbom.packages

import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.EXPRESS
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.QS
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.ROUTER
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.Bom
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.BomComponent
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PackageCatalogTest {
    @Test
    fun `should list a package two lockfiles resolve once`() {
        // Arrange
        val bom = TestBoms.trivy()

        // Act
        val catalog = PackageCatalog.of(bom)

        // Assert
        assertThat(catalog.packages.keys).containsExactly(ROUTER, EXPRESS, QS)
        assertThat(catalog.keyByRef).containsEntry("qs-ref", QS).containsEntry("qs-backend-ref", QS)
    }

    @Test
    fun `should keep the purl-less applications as sources rather than packages`() {
        // Arrange
        val bom = TestBoms.trivy()

        // Act
        val catalog = PackageCatalog.of(bom)

        // Assert
        assertThat(catalog.sources.map { it.name }).containsExactly("frontend/package-lock.json", "backend/package-lock.json")
    }

    @Test
    fun `should name, version and place each package from its purl and list what it depends on`() {
        // Arrange
        val bom = TestBoms.trivy()

        // Act
        val catalog = PackageCatalog.of(bom)

        // Assert
        val router = catalog.packages.getValue(ROUTER)
        assertThat(router.name).isEqualTo("@acme/router")
        assertThat(router.ecosystem).isEqualTo("npm")
        assertThat(catalog.packages.getValue(EXPRESS).dependsOn).containsExactly(QS)
        assertThat(catalog.packages.getValue(QS).dependsOn).isNull()
    }

    @Test
    fun `should key a package without purl by its name and version`() {
        // Arrange
        val component = BomComponent("ref", "library", "vendored", "acme", "1.2", null, emptyMap())
        val bom = Bom(emptyList(), false, null, listOf(component), emptyMap(), emptyList())

        // Act
        val catalog = PackageCatalog.of(bom)

        // Assert
        assertThat(catalog.packages.keys).containsExactly("acme/vendored@1.2")
        assertThat(catalog.packages.values.single().ecosystem).isNull()
    }
}
