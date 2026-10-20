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
import com.varabyte.kotterx.test.runtime.blockUntilRenderWhen
import com.varabyte.kotterx.test.runtime.stripFormatting
import com.varabyte.kotterx.test.terminal.assertMatches
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DialogProviderPromptCheckboxTest : DialogProviderTestBase() {
    private val emptySelectionAllowedMessage = "Empty selection is allowed"

    private val emptySelectionNotAllowedMessage = "Empty selection is not allowed!"

    private val testChoices =
        listOf(
            "element 0",
            "element 1",
            "element 2",
            "element 3"
        )

    @Test
    fun `should display all checkbox options that were specified in the correct format when the first option is selected`() {
        testSession { terminal ->
            promptCheckbox(testMessage, testChoices, testHint, true, onInputReady = {
                terminal.press(Keys.SPACE)
                terminal.press(Keys.ENTER)
            })
            terminal.assertMatches {
                bold {
                    green { text("? ") }
                    text(testMessage)
                    black(isBright = true) { textLine("  $testHint  $emptySelectionAllowedMessage") }
                }
                cyan(isBright = true) { text(" ❯ ") }
                green { text("◉ ") }
                cyan { textLine(testChoices[0]) }
                for (testItem in testChoices.drop(1)) {
                    cyan(isBright = true) { text("   ") }
                    textLine("◯ $testItem")
                }
            }
        }
    }

    @Test
    fun `should return empty input when no input was selected and empty input is allowed`() {
        var result: List<String>
        val emptyList = listOf<String>()

        testSession { terminal ->
            result =
                promptCheckbox(testMessage, testChoices, testHint, allowEmptyInput = true, onInputReady = {
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  $testHint  $emptySelectionAllowedMessage",
                " ❯ ◯ element 0",
                "   ◯ element 1",
                "   ◯ element 2",
                "   ◯ element 3",
                ""
            )
            assertThat(result).isEqualTo(emptyList)
        }
    }

    @Test
    fun `should not accept input and display hint when selection is empty and empty input is not allowed`() {
        testSession { terminal ->
            promptCheckbox(
                testMessage,
                testChoices,
                testHint,
                allowEmptyInput = false,
                onInputReady = {
                    terminal.press(Keys.ENTER)

                    blockUntilRenderWhen {
                        terminal.resolveRerenders().stripFormatting() ==
                            listOf(
                                "? $testMessage  $emptySelectionNotAllowedMessage",
                                " ❯ ◯ element 0",
                                "   ◯ element 1",
                                "   ◯ element 2",
                                "   ◯ element 3",
                                ""
                            )
                    }

                    terminal.press(Keys.SPACE)
                    terminal.press(Keys.ENTER)
                }
            )
        }
    }

    @Test
    fun `should select the first checkbox option when no arrow keys were pressed`() {
        var result: List<String>

        testSession { terminal ->
            result =
                promptCheckbox(testMessage, testChoices, testHint, onInputReady = {
                    terminal.press(Keys.SPACE)
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  $testHint",
                " ❯ ◉ element 0",
                "   ◯ element 1",
                "   ◯ element 2",
                "   ◯ element 3",
                ""
            )
            assertThat(result).isEqualTo(listOf(testChoices[0]))
        }
    }

    @Test
    fun `should select the second checkbox option when arrow down was pressed`() {
        var result: List<String>

        testSession { terminal ->
            result =
                promptCheckbox(testMessage, testChoices, testHint, onInputReady = {
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.SPACE)
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  $testHint",
                "   ◯ element 0",
                " ❯ ◉ element 1",
                "   ◯ element 2",
                "   ◯ element 3",
                ""
            )
            assertThat(result).isEqualTo(listOf(testChoices[1]))
        }
    }

    @Test
    fun `should select the third checkbox option when space, arrow down and up was pressed mixed`() {
        var result: List<String>

        testSession { terminal ->
            result =
                promptCheckbox(testMessage, testChoices, testHint, onInputReady = {
                    terminal.press(Keys.SPACE)
                    terminal.press(Keys.SPACE)
                    repeat(5) {
                        terminal.press(Keys.UP)
                    }
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.UP)
                    repeat(2) {
                        terminal.press(Keys.DOWN)
                    }
                    repeat(3) {
                        terminal.press(Keys.SPACE)
                    }
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  $testHint",
                "   ◯ element 0",
                "   ◯ element 1",
                " ❯ ◉ element 2",
                "   ◯ element 3",
                ""
            )
            assertThat(result).isEqualTo(listOf(testChoices[2]))
        }
    }

    @Test
    fun `should select last checkbox option when arrow down was pressed more often than there are options`() {
        var result: List<String>

        testSession { terminal ->
            result =
                promptCheckbox(testMessage, testChoices, testHint, onInputReady = {
                    repeat(6) {
                        terminal.press(Keys.DOWN)
                    }
                    terminal.press(Keys.SPACE)
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  $testHint",
                "   ◯ element 0",
                "   ◯ element 1",
                "   ◯ element 2",
                " ❯ ◉ element 3",
                ""
            )
            assertThat(result).isEqualTo(listOf(testChoices.last()))
        }
    }

    @Test
    fun `should select correct element when selection was made and cursor was moved afterwards`() {
        var result: List<String>

        testSession { terminal ->
            result =
                promptCheckbox(testMessage, testChoices, testHint, onInputReady = {
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.SPACE)
                    terminal.press(Keys.UP)
                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  $testHint",
                "   ◯ element 0",
                " ❯ ◯ element 1",
                "   ◉ element 2",
                "   ◯ element 3",
                ""
            )
            assertThat(result).isEqualTo(listOf(testChoices[2]))
        }
    }

    @Test
    fun `should return all selected options when multiple were selected`() {
        var result: List<String>
        val elemsToSelect = listOf(testChoices[0], testChoices[1], testChoices[3])

        testSession { terminal ->
            result =
                promptCheckbox(testMessage, testChoices, testHint, onInputReady = {
                    terminal.press(Keys.SPACE)

                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.SPACE)

                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.SPACE)

                    terminal.press(Keys.ENTER)
                })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                "? $testMessage  $testHint",
                "   ◉ element 0",
                "   ◉ element 1",
                "   ◯ element 2",
                " ❯ ◉ element 3",
                ""
            )
            assertThat(result).isEqualTo(elemsToSelect)
        }
    }
}
