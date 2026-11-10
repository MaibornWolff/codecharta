package de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

class CvssV3Test {
    @ParameterizedTest
    @CsvSource(
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H, 9.8",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H, 7.5",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N, 6.1",
        "CVSS:3.0/AV:L/AC:H/PR:H/UI:R/S:U/C:L/I:N/A:N, 1.8",
        "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H, 9.9",
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N, 0.0"
    )
    fun `should compute the base score NVD publishes for a vector`(vector: String, expectedScore: Double) {
        // Arrange + Act
        val score = CvssV3.baseScore(vector)

        // Assert
        assertThat(score).isEqualTo(expectedScore)
    }

    @ParameterizedTest
    @CsvSource("AV:N/AC:L/Au:N/C:P/I:P/A:P", "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N", "CVSS:3.1/AV:N/AC:L")
    fun `should give no score for a vector that is not a complete CVSS v3 vector`(vector: String) {
        // Arrange + Act
        val score = CvssV3.baseScore(vector)

        // Assert
        assertThat(score).isNull()
    }
}
