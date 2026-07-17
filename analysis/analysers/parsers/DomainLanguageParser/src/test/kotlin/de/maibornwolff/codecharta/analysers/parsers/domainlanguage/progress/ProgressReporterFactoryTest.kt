package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress

import kotlin.test.Test
import kotlin.test.assertIs

class ProgressReporterFactoryTest {
    @Test
    fun `should return SilentProgressReporter when quiet is true`() {
        // Arrange & Act
        val reporter = ProgressReporterFactory.create(quiet = true)

        // Assert
        assertIs<SilentProgressReporter>(reporter)
    }

    @Test
    fun `should return non-silent reporter when quiet is false`() {
        // Arrange & Act
        val reporter = ProgressReporterFactory.create(quiet = false)

        // Assert - a non-silent, ProgressTracker-backed reporter
        assertIs<ProgressReporter>(reporter)
        reporter.close()
    }
}
