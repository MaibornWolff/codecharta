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

class DialogProviderPromptListTest : DialogProviderTestBase() {
    private val testChoices =
        listOf(
            "element 0",
            "element 1",
            "element 2",
            "element 3"
        )

    @Test
    fun `should display all list options that were specified in the correct format when prompt is first displayed`() {
        testSession { terminal ->
            promptList(testMessage, testChoices, testHint, onInputReady = {
                terminal.assertMatches {
                    bold {
                        green { text("? ") }
                        text(testMessage)
                        black(isBright = true) { textLine("  $testHint") }
                    }
                    cyan(isBright = true) { text(" ❯ ") }
                    cyan { textLine(testChoices[0]) }
                    for (testItem in testChoices.drop(1)) {
                        textLine("   $testItem")
                    }
                }
                terminal.press(Keys.ENTER)
            })
        }
    }

    @Test
    fun `should select the first list option when no arrow keys were pressed`() {
        var result: String

        testSession { terminal ->
            result =
                promptList(testMessage, testChoices, onInputReady = {
                    terminal.press(Keys.ENTER)
                })

            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  arrow keys to move, ENTER to select",
                " ❯ element 0",
                "   element 1",
                "   element 2",
                "   element 3",
                ""
            )
            assertThat(result).isEqualTo(testChoices[0])
        }
    }

    @Test
    fun `should select the second list option when arrow down was pressed once after multiple up`() {
        var result: String

        testSession { terminal ->
            result =
                promptList(testMessage, testChoices, onInputReady = {
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.ENTER)
                })

            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  arrow keys to move, ENTER to select",
                "   element 0",
                " ❯ element 1",
                "   element 2",
                "   element 3",
                ""
            )
            assertThat(result).isEqualTo(testChoices[1])
        }
    }

    @Test
    fun `should not go up if in first position`() {
        var result: String

        testSession { terminal ->
            result =
                promptList(testMessage, testChoices, onInputReady = {
                    repeat(5) {
                        terminal.press(Keys.UP)
                    }
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.UP)
                    repeat(2) {
                        terminal.press(Keys.DOWN)
                    }
                    terminal.press(Keys.ENTER)
                })

            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  arrow keys to move, ENTER to select",
                "   element 0",
                "   element 1",
                " ❯ element 2",
                "   element 3",
                ""
            )
            assertThat(result).isEqualTo(testChoices[2])
        }
    }

    @Test
    fun `should select the last list option when arrow down was pressed more often than there are options`() {
        var result: String

        testSession { terminal ->
            result =
                promptList(testMessage, testChoices, onInputReady = {
                    repeat(6) {
                        terminal.press(Keys.DOWN)
                    }
                    terminal.press(Keys.ENTER)
                })

            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  arrow keys to move, ENTER to select",
                "   element 0",
                "   element 1",
                "   element 2",
                " ❯ element 3",
                ""
            )
            assertThat(result).isEqualTo(testChoices.last())
        }
    }
}
