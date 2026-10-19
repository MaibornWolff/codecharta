package de.maibornwolff.codecharta.analysers.analyserrunner

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class AnalysisConsoleTest {
    @Test
    fun `should give the console back to the analysers even when the analysis fails`() {
        // Arrange
        val console = AnalysisConsole(PrintStream(ByteArrayOutputStream()), quiet = true)
        val originalOut = System.out
        val originalErr = System.err

        // Act
        catchThrowable { console.whileAnalysing { throw IllegalStateException("analysis failed") } }

        // Assert
        assertThat(System.out).isSameAs(originalOut)
        assertThat(System.err).isSameAs(originalErr)
    }

    @Test
    fun `should keep what the analysers print off the console while quiet`() {
        // Arrange
        val analyserOutput = ByteArrayOutputStream()
        val originalOut = System.out
        System.setOut(PrintStream(analyserOutput))
        val console = AnalysisConsole(PrintStream(ByteArrayOutputStream()), quiet = true)

        // Act
        try {
            console.whileAnalysing {
                System.out.println("progress")
                System.err.println("warning")
            }
        } finally {
            System.setOut(originalOut)
        }

        // Assert
        assertThat(analyserOutput.toString()).isEmpty()
    }
}
