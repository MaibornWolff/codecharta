package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SecurityLensTest {
    @Test
    fun `should union packages and lockfiles of both lenses when merging`() {
        // Arrange
        val backend =
            lens(packages = mapOf(EXPRESS to npmPackage("express")), nodes = mapOf("backend-lock" to SecurityNode(listOf(EXPRESS))))
        val frontend =
            lens(packages = mapOf(LODASH to npmPackage("lodash")), nodes = mapOf("frontend-lock" to SecurityNode(listOf(LODASH))))

        // Act
        val merged = backend.merge(frontend)

        // Assert
        assertThat(merged.packages!!.keys).containsExactly(EXPRESS, LODASH)
        assertThat(merged.nodes!!.keys).containsExactlyInAnyOrder("backend-lock", "frontend-lock")
    }

    @Test
    fun `should keep every vulnerability and the version lookup when both lenses describe one package`() {
        // Arrange
        val fromScanner = lens(
            packages = mapOf(
                EXPRESS to npmPackage("express", vulnerabilities = listOf(vulnerability("CVE-2"), vulnerability("CVE-1")))
            )
        )
        val withVersions =
            lens(
                packages = mapOf(
                    EXPRESS to npmPackage("express", vulnerabilities = listOf(vulnerability("CVE-1"))).copy(newestVersion = "5.0.0")
                )
            )

        // Act
        val merged = fromScanner.merge(withVersions).packages!!.getValue(EXPRESS)

        // Assert
        assertThat(merged.vulnerabilities!!.map { it.id }).containsExactly("CVE-1", "CVE-2")
        assertThat(merged.newestVersion).isEqualTo("5.0.0")
    }

    @Test
    fun `should mark the packages of an unchecked lens as unknown when merged with a checked one`() {
        // Arrange
        val checked = lens(packages = mapOf(EXPRESS to npmPackage("express")), vulnerabilitiesMeasured = true)
        val unchecked = lens(packages = mapOf(LODASH to npmPackage("lodash")))

        // Act
        val merged = checked.merge(unchecked)

        // Assert
        assertThat(merged.vulnerabilitiesMeasured).isTrue()
        assertThat(merged.packages!!.getValue(LODASH).vulnerabilitiesUnknown).isTrue()
        assertThat(merged.packages!!.getValue(EXPRESS).vulnerabilitiesUnknown).isNull()
    }

    @Test
    fun `should count a package as checked when one of the merged lenses checked it`() {
        // Arrange
        val checked = lens(packages = mapOf(EXPRESS to npmPackage("express")), vulnerabilitiesMeasured = true)
        val unchecked = lens(packages = mapOf(EXPRESS to npmPackage("express")))

        // Act
        val merged = unchecked.merge(checked)

        // Assert
        assertThat(merged.packages!!.getValue(EXPRESS).vulnerabilitiesUnknown).isNull()
    }

    @Test
    fun `should keep the later version lookup of two merged lenses`() {
        // Arrange
        val older = lens(packages = mapOf(EXPRESS to npmPackage("express")), versionsLookup = VersionsLookup("deps.dev", "2026-11-01"))
        val newer = lens(packages = mapOf(LODASH to npmPackage("lodash")), versionsLookup = VersionsLookup("deps.dev", "2026-11-09"))

        // Act
        val merged = older.merge(newer)

        // Assert
        assertThat(merged.versionsLookup).isEqualTo(VersionsLookup("deps.dev", "2026-11-09"))
    }

    @Test
    fun `should return the other lens when this one carries nothing`() {
        // Arrange
        val populated = lens(packages = mapOf(EXPRESS to npmPackage("express")))

        // Act
        val merged = SecurityLens().merge(populated)

        // Assert
        assertThat(merged).isEqualTo(populated)
    }

    @Test
    fun `should re-key lockfile entries onto a restructured tree and drop those that did not survive`() {
        // Arrange
        val before =
            Node("root", NodeType.Folder, children = setOf(Node("package-lock.json", NodeType.File), Node("old.lock", NodeType.File)))
        val after =
            Node(
                "root",
                NodeType.Folder,
                children = setOf(Node("app", NodeType.Folder, children = setOf(Node("package-lock.json", NodeType.File))))
            )
        val lockfileId = NodeId.fromSegments(listOf("package-lock.json"), NodeType.File)
        val droppedId = NodeId.fromSegments(listOf("old.lock"), NodeType.File)
        val securityLens = lens(nodes = mapOf(lockfileId to SecurityNode(listOf(EXPRESS)), droppedId to SecurityNode(listOf(LODASH))))
        val moveIntoApp: SegmentRemapping = { segments ->
            if (segments ==
                listOf("old.lock")
            ) {
                null
            } else if (segments.isEmpty()) {
                segments
            } else {
                listOf("app") + segments
            }
        }

        // Act
        val rekeyed = securityLens.rekeyed(before, after, moveIntoApp)

        // Assert
        val movedId = NodeId.fromSegments(listOf("app", "package-lock.json"), NodeType.File)
        assertThat(rekeyed.nodes).containsOnlyKeys(movedId)
    }

    private fun lens(
        packages: Map<String, SecurityPackage>? = null,
        nodes: Map<String, SecurityNode>? = null,
        vulnerabilitiesMeasured: Boolean? = null,
        versionsLookup: VersionsLookup? = null
    ) = SecurityLens(
        vulnerabilitiesMeasured = vulnerabilitiesMeasured,
        versionsLookup = versionsLookup,
        packages = packages,
        nodes = nodes
    )

    private fun npmPackage(name: String, vulnerabilities: List<SecurityVulnerability>? = null) =
        SecurityPackage(name = name, version = "1.0.0", ecosystem = "npm", vulnerabilities = vulnerabilities)

    private fun vulnerability(id: String) = SecurityVulnerability(id = id, severity = "high", score = 7.5)

    companion object {
        private const val EXPRESS = "pkg:npm/express@1.0.0"
        private const val LODASH = "pkg:npm/lodash@1.0.0"
    }
}
