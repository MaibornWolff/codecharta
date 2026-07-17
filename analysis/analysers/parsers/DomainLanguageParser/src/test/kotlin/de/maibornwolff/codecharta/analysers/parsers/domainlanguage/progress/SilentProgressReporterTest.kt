package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress

import kotlin.test.Test

class SilentProgressReporterTest {
    @Test
    fun `should not throw on any operation`() {
        // Arrange & Act & Assert - no exceptions
        SilentProgressReporter.startPhase("Test", 100)
        SilentProgressReporter.advance(50)
        SilentProgressReporter.completePhase()
        SilentProgressReporter.close()
    }

    @Test
    fun `should handle indeterminate phase`() {
        // Arrange & Act & Assert - no exceptions
        SilentProgressReporter.startPhase("Scanning", null)
        SilentProgressReporter.advance()
        SilentProgressReporter.completePhase()
    }

    @Test
    fun `should be safe for multiple phases`() {
        // Arrange & Act & Assert - no exceptions
        SilentProgressReporter.startPhase("Phase 1", 100)
        SilentProgressReporter.advance(100)
        SilentProgressReporter.completePhase()

        SilentProgressReporter.startPhase("Phase 2", 50)
        SilentProgressReporter.advance(50)
        SilentProgressReporter.completePhase()
    }
}
