package de.maibornwolff.codecharta.analysers.importers.sbom.versions

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

class VersionOrderTest {
    @ParameterizedTest
    @CsvSource("1.2.10, 1.2.9", "2.0.0, 2.0.0-rc.1", "1.2.1, 1.2", "v1.10.0, v1.9.3", "31.1-jre, 30.1-jre", "1.0.0-rc.2, 1.0.0-rc.1")
    fun `should order the newer version after the older one`(newer: String, older: String) {
        // Arrange + Act
        val comparison = VersionOrder.compare(newer, older)

        // Assert
        assertThat(comparison).isPositive()
    }

    @Test
    fun `should treat a version with and without the v prefix as equal`() {
        // Arrange + Act
        val comparison = VersionOrder.compare("v1.2.3", "1.2.3")

        // Assert
        assertThat(comparison).isZero()
    }
}
