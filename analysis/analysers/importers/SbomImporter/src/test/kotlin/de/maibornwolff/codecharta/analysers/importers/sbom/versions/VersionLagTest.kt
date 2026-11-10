package de.maibornwolff.codecharta.analysers.importers.sbom.versions

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.LocalDate

class VersionLagTest {
    private val lookupDate = LocalDate.of(2026, 11, 9)
    private val published = listOf(
        PublishedVersion("1.0.0", LocalDate.of(2024, 1, 1)),
        PublishedVersion("1.1.0", LocalDate.of(2025, 1, 1)),
        PublishedVersion("2.0.0-beta.1", LocalDate.of(2025, 6, 1)),
        PublishedVersion("2.0.0", LocalDate.of(2026, 1, 1)),
        PublishedVersion("1.0.1", LocalDate.of(2026, 3, 1))
    )

    @Test
    fun `should count the stable newer versions and the days since the first of them was released`() {
        // Arrange + Act
        val lag = VersionLag.of("1.0.0", "npm", published, lookupDate)

        // Assert
        assertThat(lag.newestVersion).isEqualTo("2.0.0")
        assertThat(lag.newerVersions).isEqualTo(3)
        assertThat(lag.daysOutdated).isEqualTo(677)
        assertThat(lag.libyears).isEqualTo(2.0)
    }

    @Test
    fun `should measure no lag for the newest version`() {
        // Arrange + Act
        val lag = VersionLag.of("2.0.0", "npm", published, lookupDate)

        // Assert
        assertThat(lag).isEqualTo(Lag("2.0.0", 0, 0, 0.0))
    }

    @Test
    fun `should leave the days and libyears open when the registry gives no release dates`() {
        // Arrange
        val undated = listOf(PublishedVersion("1.0.0", null), PublishedVersion("1.2.0", null))

        // Act
        val lag = VersionLag.of("1.0.0", "npm", undated, lookupDate)

        // Assert
        assertThat(lag).isEqualTo(Lag("1.2.0", 1, null, null))
    }
}
