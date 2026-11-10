package de.maibornwolff.codecharta.analysers.importers.sbom.lockfiles

import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.EXPRESS
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.QS
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.ROUTER
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.Bom
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.BomComponent
import de.maibornwolff.codecharta.analysers.importers.sbom.packages.PackageCatalog
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class LockfileLocatorTest {
    @TempDir
    lateinit var tempDir: File

    @Test
    fun `should give a Trivy lockfile every package it resolves and its direct ones apart`() {
        // Arrange
        val bom = TestBoms.trivy()
        val projectFolder = TestBoms.projectFolderWith(tempDir, "frontend/package-lock.json", "backend/package-lock.json")

        // Act
        val search = LockfileLocator(projectFolder).locate(bom, PackageCatalog.of(bom))

        // Assert
        val frontend = search.found.single { it.segments == listOf("frontend", "package-lock.json") }
        assertThat(frontend.declares).containsExactly(ROUTER, EXPRESS, QS)
        assertThat(frontend.dependsOn).containsExactly(ROUTER, EXPRESS)
        assertThat(search.missing).isEmpty()
    }

    @Test
    fun `should report a lockfile the project folder does not hold`() {
        // Arrange
        val bom = TestBoms.trivy()
        val projectFolder = TestBoms.projectFolderWith(tempDir, "frontend/package-lock.json")

        // Act
        val search = LockfileLocator(projectFolder).locate(bom, PackageCatalog.of(bom))

        // Assert
        assertThat(search.found.map { it.segments.joinToString("/") }).containsExactly("frontend/package-lock.json")
        assertThat(search.missing).containsExactly("backend/package-lock.json")
    }

    @Test
    fun `should group cdxgen packages by the source file they name and drop folders above the project`() {
        // Arrange
        val bom = TestBoms.cdxgen()
        val projectFolder = TestBoms.projectFolderWith(tempDir, "package-lock.json")

        // Act
        val search = LockfileLocator(projectFolder).locate(bom, PackageCatalog.of(bom))

        // Assert
        val lockfile = search.found.single()
        assertThat(lockfile.segments).containsExactly("package-lock.json")
        assertThat(lockfile.declares).containsExactly(EXPRESS, QS)
        assertThat(lockfile.dependsOn).containsExactly(EXPRESS)
    }

    @Test
    fun `should count the packages behind the project's own module as the lockfile's direct ones`() {
        // Arrange
        val components = listOf(
            BomComponent("go-mod", "application", "go.mod", null, null, null, emptyMap()),
            BomComponent("main-module", "library", "example.com/shop", null, null, "pkg:golang/example.com/shop", emptyMap()),
            BomComponent(
                "errors",
                "library",
                "github.com/pkg/errors",
                null,
                "v0.9.1",
                "pkg:golang/github.com/pkg/errors@v0.9.1",
                emptyMap()
            )
        )
        val dependsOn = mapOf("go-mod" to listOf("main-module"), "main-module" to listOf("errors"))
        val bom = Bom(emptyList(), false, null, components, dependsOn, emptyList())
        val projectFolder = TestBoms.projectFolderWith(tempDir, "go.mod")

        // Act
        val search = LockfileLocator(projectFolder).locate(bom, PackageCatalog.of(bom))

        // Assert
        val lockfile = search.found.single()
        assertThat(lockfile.dependsOn).containsExactly("pkg:golang/github.com/pkg/errors@v0.9.1")
        assertThat(lockfile.declares).containsExactly("pkg:golang/github.com/pkg/errors@v0.9.1")
    }

    @Test
    fun `should resolve an absolute path inside the project folder`() {
        // Arrange
        val projectFolder = TestBoms.projectFolderWith(tempDir, "app/requirements.txt")
        val absolute = File(projectFolder, "app/requirements.txt").absolutePath

        // Act
        val segments = LockfileLocator(projectFolder).resolve(absolute)

        // Assert
        assertThat(segments).containsExactly("app", "requirements.txt")
    }
}
