package de.maibornwolff.codecharta.analysers.importers.sbom

import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.EXPRESS
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.QS
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.ROUTER
import de.maibornwolff.codecharta.analysers.importers.sbom.http.HttpReply
import de.maibornwolff.codecharta.analysers.importers.sbom.versions.DepsDevLookup
import de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities.OsvLookup
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.VersionsLookup
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.time.LocalDate

class SbomImportTest {
    @TempDir
    lateinit var tempDir: File

    @Test
    fun `should put the lockfiles into the tree and the packages with the scanner's findings into the lens`() {
        // Arrange
        val projectFolder = TestBoms.projectFolderWith(tempDir, "frontend/package-lock.json", "backend/package-lock.json")

        // Act
        val result = SbomImport(projectFolder).run(TestBoms.trivy())

        // Assert
        val lens = result.project.lenses.security!!
        assertThat(lens.vulnerabilitiesMeasured).isTrue()
        assertThat(lens.vulnerabilitySources).containsExactly("trivy 0.76.1")
        assertThat(lens.packages!!.getValue(QS).vulnerabilities!!.map { it.id }).containsExactly("CVE-2022-24999")
        val frontendId = NodeId.fromSegments(listOf("frontend", "package-lock.json"), NodeType.File)
        assertThat(lens.nodes!!.getValue(frontendId).declares).containsExactly(ROUTER, EXPRESS, QS)
        assertThat(result.project.rootNode.children.map { it.name }).containsExactlyInAnyOrder("frontend", "backend")
        assertThat(result.hints.single()).contains("--deps-dev")
    }

    @Test
    fun `should leave vulnerabilities unmeasured and say so when no scanner made the SBOM`() {
        // Arrange
        val projectFolder = TestBoms.projectFolderWith(tempDir, "package-lock.json")

        // Act
        val result = SbomImport(projectFolder).run(TestBoms.cdxgen())

        // Assert
        assertThat(result.project.lenses.security!!.vulnerabilitiesMeasured).isNull()
        assertThat(result.hints).anyMatch { it.startsWith("Vulnerabilities are not measured") }
    }

    @Test
    fun `should ask OSV when no scanner made the SBOM and mark what it could not check`() {
        // Arrange
        val projectFolder = TestBoms.projectFolderWith(tempDir, "package-lock.json")
        val osv = OsvLookup(FakeHttpGateway(postReply = { _, _ -> HttpReply(200, """{"results":[{},{"vulns":[{"id":"OSV-1"}]}]}""") }))

        // Act
        val result = SbomImport(projectFolder, osvLookup = osv).run(TestBoms.cdxgen())

        // Assert
        val lens = result.project.lenses.security!!
        assertThat(lens.vulnerabilitiesMeasured).isTrue()
        assertThat(lens.vulnerabilitySources).containsExactly("osv")
        assertThat(lens.packages!!.getValue(QS).vulnerabilities!!.map { it.id }).containsExactly("OSV-1")
        assertThat(lens.packages!!.getValue(EXPRESS).vulnerabilities).isNull()
    }

    @Test
    fun `should skip OSV when the scanner already checked every package`() {
        // Arrange
        val projectFolder = TestBoms.projectFolderWith(tempDir, "frontend/package-lock.json", "backend/package-lock.json")
        val http = FakeHttpGateway()

        // Act
        val result = SbomImport(projectFolder, osvLookup = OsvLookup(http)).run(TestBoms.trivy())

        // Assert
        assertThat(http.requests).isEmpty()
        assertThat(result.hints).anyMatch { it.startsWith("OSV lookup skipped") }
    }

    @Test
    fun `should add the version lag and the lookup date when deps_dev is asked`() {
        // Arrange
        val projectFolder = TestBoms.projectFolderWith(tempDir, "frontend/package-lock.json", "backend/package-lock.json")
        val versions = """{"versions":[{"versionKey":{"version":"6.5.2"},"publishedAt":"2018-01-01T00:00:00Z"},""" +
            """{"versionKey":{"version":"6.5.3"},"publishedAt":"2026-11-01T00:00:00Z"}]}"""
        val http = FakeHttpGateway(mapOf("https://api.deps.dev/v3/systems/NPM/packages/qs" to HttpReply(200, versions)))

        // Act
        val result = SbomImport(
            projectFolder,
            depsDevLookup = DepsDevLookup(http),
            today = { LocalDate.of(2026, 11, 9) }
        ).run(TestBoms.trivy())

        // Assert
        val lens = result.project.lenses.security!!
        assertThat(lens.versionsLookup).isEqualTo(VersionsLookup("deps.dev", "2026-11-09"))
        assertThat(lens.packages!!.getValue(QS).daysOutdated).isEqualTo(8)
        assertThat(lens.packages!!.getValue(EXPRESS).newestVersion).isNull()
        assertThat(result.hints).anyMatch { it.startsWith("deps.dev knew no versions of 2 packages") }
    }

    @Test
    fun `should name the lockfiles it did not find`() {
        // Arrange
        val projectFolder = TestBoms.projectFolderWith(tempDir, "frontend/package-lock.json")

        // Act
        val result = SbomImport(projectFolder).run(TestBoms.trivy())

        // Assert
        assertThat(result.hints).anyMatch { it.startsWith("1 lockfile of the SBOM not found") && it.endsWith("backend/package-lock.json") }
    }
}
