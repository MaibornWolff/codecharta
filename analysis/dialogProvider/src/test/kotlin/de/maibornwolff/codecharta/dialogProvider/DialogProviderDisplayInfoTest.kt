package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.yellow
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.terminal.assertMatches
import org.junit.jupiter.api.Test

class DialogProviderDisplayInfoTest {
    @Test
    fun `displayInfo should print message as expected`() {
        val testString = "testString"
        testSession { terminal ->
            displayInfo(testString)
            terminal.assertMatches {
                yellow { text("! ") }
                text(testString)
            }
        }
    }
}
