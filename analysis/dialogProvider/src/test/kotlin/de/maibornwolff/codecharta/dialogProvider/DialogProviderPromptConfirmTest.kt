package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.cyan
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.resolveRerenders
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.runtime.stripFormatting
import com.varabyte.kotterx.test.terminal.assertMatches
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DialogProviderPromptConfirmTest : DialogProviderTestBase() {
    @Test
    fun `should correctly display all text formatting when prompt is first displayed`() {
        testSession { terminal ->
            promptConfirm(testMessage, testHint, onInputReady = {
                terminal.assertMatches {
                    bold {
                        green { text("? ") }
                        text(testMessage)
                        black(isBright = true) { textLine("  $testHint") }
                    }
                    text("> ")
                    cyan { text("[Yes]") }
                    textLine(" No ")
                }
                terminal.press(Keys.ENTER)
            })
        }
    }

    @Test
    fun `should return true and display correct state when no arrow keys were pressed`() {
        var result: Boolean

        testSession { terminal ->
            result =
                promptConfirm(testMessage, onInputReady = {
                    terminal.press(Keys.ENTER)
                })

            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  arrow keys to change selection",
                "> [Yes] No ",
                ""
            )
            assertThat(result).isTrue()
        }
    }

    @Test
    fun `should return false and display correct state when right arrow key was pressed`() {
        var result: Boolean

        testSession { terminal ->
            result =
                promptConfirm(testMessage, testHint, onInputReady = {
                    terminal.press(Keys.RIGHT)
                    terminal.press(Keys.ENTER)
                })

            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  $testHint",
                ">  Yes [No]",
                ""
            )
            assertThat(result).isFalse()
        }
    }

    @Test
    fun `should correctly return when arrow keys were pressed multiple times`() {
        var result: Boolean

        testSession { terminal ->
            result =
                promptConfirm(testMessage, onInputReady = {
                    repeat(5) {
                        terminal.press(Keys.RIGHT)
                    }
                    terminal.press(Keys.LEFT)
                    terminal.press(Keys.ENTER)
                })
            assertThat(result).isTrue()
        }
    }
}
