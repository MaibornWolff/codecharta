package de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

class SeverityTest {
    @ParameterizedTest
    @CsvSource("9.0, critical", "8.9, high", "7.0, high", "6.9, medium", "4.0, medium", "3.9, low", "0.1, low", "0.0, unknown")
    fun `should bucket a score with NVD's thresholds`(score: Double, expectedSeverity: String) {
        // Arrange + Act
        val severity = Severity.ofScore(score)

        // Assert
        assertThat(severity).isEqualTo(expectedSeverity)
    }

    @Test
    fun `should prefer the highest CVSS v3 score over other scores`() {
        // Arrange + Act
        val rating = Severity.rate(listOf(5.3, 7.5), listOf(9.3), listOf("critical"))

        // Assert
        assertThat(rating).isEqualTo(Rating(Severity.HIGH, 7.5))
    }

    @Test
    fun `should fall back to other scores and then to the worst label`() {
        // Arrange + Act
        val fromOtherScore = Severity.rate(emptyList(), listOf(9.3), emptyList())
        val fromLabels = Severity.rate(emptyList(), emptyList(), listOf("LOW", "Moderate"))
        val withoutAnything = Severity.rate(emptyList(), emptyList(), listOf("none"))

        // Assert
        assertThat(fromOtherScore).isEqualTo(Rating(Severity.CRITICAL, 9.3))
        assertThat(fromLabels).isEqualTo(Rating(Severity.MEDIUM, null))
        assertThat(withoutAnything).isEqualTo(Rating(Severity.UNKNOWN, null))
    }
}
