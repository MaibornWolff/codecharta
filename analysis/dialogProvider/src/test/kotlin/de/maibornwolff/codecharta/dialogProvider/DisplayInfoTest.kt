package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.yellow
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.terminal.assertMatches
import org.junit.jupiter.api.Test

class DisplayInfoTest {
    @Test
    fun `should print the info message with a leading exclamation mark`() {
        // Arrange
        val testString = "testString"

        testSession { terminal ->
            // Act
            displayInfo(testString)

            // Assert
            terminal.assertMatches {
                yellow { text("! ") }
                text(testString)
            }
        }
    }
}
