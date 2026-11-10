package de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities

import de.maibornwolff.codecharta.analysers.importers.sbom.FakeHttpGateway
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.EXPRESS
import de.maibornwolff.codecharta.analysers.importers.sbom.TestBoms.QS
import de.maibornwolff.codecharta.analysers.importers.sbom.http.HttpReply
import de.maibornwolff.codecharta.model.SecurityVulnerability
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class OsvLookupTest {
    private val qsDetails =
        """{"id":"GHSA-hrpp-h998-j3pp","aliases":["CVE-2022-24999"],""" +
            """"severity":[{"type":"CVSS_V3","score":"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"}],""" +
            """"affected":[{"package":{"ecosystem":"npm","name":"qs","purl":"pkg:npm/qs"},""" +
            """"ranges":[{"type":"SEMVER","events":[{"introduced":"0"},{"fixed":"6.5.3"}]}]},""" +
            """{"package":{"ecosystem":"npm","name":"other","purl":"pkg:npm/other"},"ranges":[{"events":[{"fixed":"9.9.9"}]}]}]}"""

    @Test
    fun `should ask in one batch and describe each hit with its CVE id, rating and fixed versions`() {
        // Arrange
        val http = FakeHttpGateway(
            getReplies = mapOf("https://api.osv.dev/v1/vulns/GHSA-hrpp-h998-j3pp" to HttpReply(200, qsDetails)),
            postReply = { _, _ -> HttpReply(200, """{"results":[{},{"vulns":[{"id":"GHSA-hrpp-h998-j3pp"}]}]}""") }
        )

        // Act
        val result = OsvLookup(http).check(listOf(QS, EXPRESS))

        // Assert
        assertThat(result.vulnerabilities).containsOnlyKeys(QS)
        assertThat(result.vulnerabilities.getValue(QS))
            .containsExactly(SecurityVulnerability("CVE-2022-24999", Severity.HIGH, 7.5, listOf("6.5.3"), "osv"))
        assertThat(result.unchecked).isEmpty()
        assertThat(http.requests.first()).contains("pkg:npm/express@4.17.1").contains("pkg:npm/qs@6.5.2")
    }

    @Test
    fun `should leave packages unchecked when their batch fails or they have no version`() {
        // Arrange
        val http = FakeHttpGateway(postReply = { _, _ -> HttpReply(503, "") })

        // Act
        val result = OsvLookup(http).check(listOf(QS, "vendored@"))

        // Assert
        assertThat(result.unchecked).containsExactlyInAnyOrder(QS, "vendored@")
        assertThat(result.vulnerabilities).isEmpty()
    }

    @Test
    fun `should follow the next page of a query with many hits`() {
        // Arrange
        val http = FakeHttpGateway(
            postReply = { _, body ->
                if ("page_token" in body) {
                    HttpReply(200, """{"results":[{"vulns":[{"id":"OSV-2"}]}]}""")
                } else {
                    HttpReply(200, """{"results":[{"vulns":[{"id":"OSV-1"}],"next_page_token":"next"}]}""")
                }
            }
        )

        // Act
        val result = OsvLookup(http).check(listOf(QS))

        // Assert: the details failed, so both stay with an unknown severity under their OSV ids
        assertThat(result.vulnerabilities.getValue(QS).map { it.id }).containsExactly("OSV-1", "OSV-2")
        assertThat(result.vulnerabilities.getValue(QS).map { it.severity }).containsOnly(Severity.UNKNOWN)
    }
}
