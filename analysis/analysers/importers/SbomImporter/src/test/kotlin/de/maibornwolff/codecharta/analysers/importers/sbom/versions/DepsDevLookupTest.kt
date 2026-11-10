package de.maibornwolff.codecharta.analysers.importers.sbom.versions

import de.maibornwolff.codecharta.analysers.importers.sbom.FakeHttpGateway
import de.maibornwolff.codecharta.analysers.importers.sbom.http.HttpReply
import de.maibornwolff.codecharta.model.SecurityPackage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.LocalDate

class DepsDevLookupTest {
    private val lookupDate = LocalDate.of(2026, 11, 9)
    private val routerVersions =
        """{"versions":[{"versionKey":{"system":"NPM","name":"@acme/router","version":"2.0.0"},"publishedAt":"2025-01-01T10:00:00Z"},""" +
            """{"versionKey":{"system":"NPM","name":"@acme/router","version":"2.1.0"},"publishedAt":"2026-11-01T10:00:00Z"}]}"""

    @Test
    fun `should look up each package name once and measure every used version`() {
        // Arrange
        val packages = mapOf(
            "pkg:npm/%40acme/router@2.0.0" to SecurityPackage("@acme/router", "2.0.0", "npm"),
            "pkg:npm/%40acme/router@2.1.0" to SecurityPackage("@acme/router", "2.1.0", "npm")
        )
        val http = FakeHttpGateway(mapOf("https://api.deps.dev/v3/systems/NPM/packages/%40acme%2Frouter" to HttpReply(200, routerVersions)))

        // Act
        val result = DepsDevLookup(http).lookUp(packages, lookupDate)

        // Assert
        assertThat(http.requests).containsExactly("GET https://api.deps.dev/v3/systems/NPM/packages/%40acme%2Frouter")
        assertThat(result.lags.getValue("pkg:npm/%40acme/router@2.0.0")).isEqualTo(Lag("2.1.0", 1, 8, 1.83))
        assertThat(result.lags.getValue("pkg:npm/%40acme/router@2.1.0").newerVersions).isZero()
    }

    @Test
    fun `should tell packages deps_dev does not cover, does not know and could not answer for apart`() {
        // Arrange
        val packages = mapOf(
            "vendored@1.0" to SecurityPackage("vendored", "1.0"),
            "pkg:npm/ghost@1.0.0" to SecurityPackage("ghost", "1.0.0", "npm"),
            "pkg:pypi/flaky@1.0.0" to SecurityPackage("flaky", "1.0.0", "pypi")
        )
        val http = FakeHttpGateway(mapOf("https://api.deps.dev/v3/systems/PYPI/packages/flaky" to HttpReply(500, "")))

        // Act
        val result = DepsDevLookup(http).lookUp(packages, lookupDate)

        // Assert
        assertThat(result.unsupported).containsExactly("vendored@1.0")
        assertThat(result.notFound).containsExactly("pkg:npm/ghost@1.0.0")
        assertThat(result.failed).containsExactly("pkg:pypi/flaky@1.0.0")
        assertThat(result.lags).isEmpty()
    }
}
