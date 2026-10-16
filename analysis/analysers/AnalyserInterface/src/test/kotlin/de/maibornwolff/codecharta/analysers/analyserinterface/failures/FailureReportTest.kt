package de.maibornwolff.codecharta.analysers.analyserinterface.failures

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FailureReportTest {
    @Test
    fun `should name the cause and the one file it made fail`() {
        // Arrange
        val failures = listOf(FailedFile("src/Broken.kt", IllegalStateException("broken extractor")))

        // Act
        val warnings = FailureReport.warningsOf(failures)

        // Assert
        assertThat(warnings).containsExactly(
            "1 file could not be analysed and is missing from the output (IllegalStateException: broken extractor): src/Broken.kt"
        )
    }

    @Test
    fun `should list five files of a cause and count the others`() {
        // Arrange
        val cause = IllegalArgumentException("unexpected node")
        val failures = (1..7).map { FailedFile("src/File$it.kt", cause) }

        // Act
        val warnings = FailureReport.warningsOf(failures)

        // Assert
        assertThat(warnings).containsExactly(
            "7 files could not be analysed and are missing from the output (IllegalArgumentException: unexpected node): " +
                "src/File1.kt, src/File2.kt, src/File3.kt, src/File4.kt, src/File5.kt and 2 more"
        )
    }

    @Test
    fun `should warn once per distinct cause, the most frequent first`() {
        // Arrange
        val failures = listOf(
            FailedFile("a.kt", IllegalStateException("one")),
            FailedFile("b.kt", IllegalStateException("two")),
            FailedFile("c.kt", IllegalStateException("two"))
        )

        // Act
        val warnings = FailureReport.warningsOf(failures)

        // Assert
        assertThat(warnings).containsExactly(
            "2 files could not be analysed and are missing from the output (IllegalStateException: two): b.kt, c.kt",
            "1 file could not be analysed and is missing from the output (IllegalStateException: one): a.kt"
        )
    }
}
