package de.maibornwolff.codecharta.analysers.importers.sbom.versions

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

class StableVersionsTest {
    @ParameterizedTest
    @CsvSource(
        "npm, 4.18.2, true",
        "npm, 5.0.0-beta.1, false",
        "golang, v0.0.0-20210101000000-abcdef123456, false",
        "maven, 31.1-jre, true",
        "maven, 2.0.0.RELEASE, true",
        "maven, 3.0.0-M1, false",
        "maven, 1.0-SNAPSHOT, false",
        "maven, 6.0.0-RC2, false",
        "pypi, 2.31.0, true",
        "pypi, 3.0.0b1, false",
        "pypi, 1.0.dev3, false",
        "gem, 7.1.0.rc1, false",
        "gem, 7.1.0, true",
        "unknown, 1.0.0-canary.4, false"
    )
    fun `should tell a release from a pre-release by the ecosystem's rules`(ecosystem: String, version: String, isStable: Boolean) {
        // Arrange + Act
        val stable = StableVersions.isStable(version, ecosystem.takeIf { it != "unknown" })

        // Assert
        assertThat(stable).isEqualTo(isStable)
    }
}
