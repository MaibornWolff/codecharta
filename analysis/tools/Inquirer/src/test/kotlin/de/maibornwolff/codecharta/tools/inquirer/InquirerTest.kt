package de.maibornwolff.codecharta.tools.inquirer

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.cyan
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.invert
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotterx.test.foundation.input.press
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.runtime.blockUntilRenderWhen
import com.varabyte.kotterx.test.runtime.stripFormatting
import com.varabyte.kotterx.test.terminal.assertMatches
import com.varabyte.kotterx.test.terminal.resolveRerenders
import com.varabyte.kotterx.test.terminal.type
import kotlinx.coroutines.TimeoutCancellationException
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.lang.AssertionError

class InquirerTest {

    private val testInput = "this is text to simulate user input."

    private val testMessage = "this test message is displayed as the question."
    private val testHint = "this is displayed as the hint for a prompt."
    private val testInvalidInputMessage = "this is displayed as a message for invalid inputs."

    private val emptyInputAllowedMessage = "Empty input is allowed"
    private val emptyInputNotAllowedMessage = "Empty input is not allowed!"
    private val emptySelectionAllowedMessage = "Empty selection is allowed"
    private val emptySelectionNotAllowedMessage = "Empty selection is not allowed!"

    private val testChoices = listOf(
            "element 0",
            "element 1",
            "element 2",
            "element 3"
    )

    // Tests for promptInput

    @Test
    fun `should correctly apply the text formatting when prompt is first displayed`() {
        testSession { terminal ->
            myPromptInput(testMessage, testHint, true, testInvalidInputMessage, onInputReady = {
                terminal.assertMatches {
                    bold {
                        green { text("? ") }; text(testMessage)
                        black(isBright = true) { textLine("  $emptyInputAllowedMessage") }
                    }
                    text("> "); black(isBright = true) { invert { text("${testHint[0]}")}; text("${testHint.drop(1)} ") }
                }
                terminal.press(Keys.ENTER)
            })
        }
    }

    @Test
    fun `should return user input when no validity checker was specified`() {
        var result: String

        testSession { terminal ->
            result = myPromptInput(testMessage, onInputReady = {
                terminal.type(testInput)
                terminal.press(Keys.ENTER)
            })

            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                    "? $testMessage",
                    "> $testInput ",
                    ""
            )
            assertThat(result).isEqualTo(testInput)
        }
    }

    @Test
    fun `should return empty input when the option to allow empty input was set`() {
        var result: String

        testSession { terminal ->
            result = myPromptInput(testMessage, allowEmptyInput = true, onInputReady = {
                terminal.press(Keys.ENTER)


                assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                    "? $testMessage  $emptyInputAllowedMessage",
                    ">  ",
                    ""
                )
            })
            assertThat(result).isEqualTo("")
        }
    }

    @Test
    fun `should not accept empty input and display warning message when empty input is not allowed`() {
        testSession { terminal ->
            myPromptInput(testMessage, allowEmptyInput = false,
                onInputReady = {
                    terminal.press(Keys.ENTER)

                    try {               //TODO: check back if try catch block can be removed after dev answer
                        blockUntilRenderWhen {
                            terminal.resolveRerenders().stripFormatting() == listOf(
                                "? $testMessage  $emptyInputNotAllowedMessage",
                                ">  ",
                                ""
                            )
                        }
                    }
                    catch (ex: TimeoutCancellationException) {
                        throw AssertionError("Render did not match expected result!\n" + ex.printStackTrace())
                    }

                    terminal.type("irrelevant non empty input")
                    terminal.press(Keys.ENTER)
                }
            )
        }
    }

    @Test
    fun `should return input when a validity checker was specified and input is valid`() {
        var result: String

        testSession { terminal ->
            result = myPromptInput(testMessage, inputValidator = { true }, onInputReady = {
                terminal.type(testInput)
                terminal.press(Keys.ENTER)
            })
            assertThat(result).isEqualTo(testInput)
        }
    }

    @Test
    fun `should return empty input when option to allow empty input was set but the specified validity checker would not allow it`() {
        var result: String

        testSession { terminal ->
            result = myPromptInput(testMessage, allowEmptyInput = true, inputValidator = { false }, onInputReady = {
                terminal.press(Keys.ENTER)
            })
            assertThat(result).isEqualTo("")
        }
    }


    @Test
    fun `should not accept input and display default warning message when input was invalid`() {
        testSession { terminal ->
            myPromptInput(testMessage, allowEmptyInput = false,
                inputValidator = { input -> input.contains("accepted") },
                onInputReady = {
                    terminal.type("x")
                    terminal.press(Keys.ENTER)

                    try {               //TODO: check back if try catch block can be removed after dev answer
                        blockUntilRenderWhen {
                            terminal.resolveRerenders().stripFormatting() == listOf(
                                "? $testMessage  Input is invalid!",
                                "> x ",
                                ""
                            )
                        }
                    }
                    catch (ex: TimeoutCancellationException) {
                        throw AssertionError("Render did not match expected result!\n" + ex.printStackTrace())
                    }

                    terminal.type("accepted")
                    terminal.press(Keys.ENTER)
                }
            )
        }
    }

    @Test
    fun `should not accept input and display custom warning message when a custom invalid input message was specified and input was invalid`() {
        testSession { terminal ->
            myPromptInput(testMessage, allowEmptyInput = false, invalidInputMessage = testInvalidInputMessage,
                inputValidator = { input -> input.contains("accepted") },
                onInputReady = {
                    terminal.type("x")
                    terminal.press(Keys.ENTER)

                    try {               //TODO: check back if try catch block can be removed after dev answer
                        blockUntilRenderWhen {
                            terminal.resolveRerenders().stripFormatting() == listOf(
                                "? $testMessage  $testInvalidInputMessage",
                                "> x ",
                                ""
                            )
                        }
                    }
                    catch (ex: TimeoutCancellationException) {
                        throw AssertionError("Render did not match expected result!\n" + ex.printStackTrace())
                    }

                    terminal.type("accepted")
                    terminal.press(Keys.ENTER)
                }
            )
        }
    }

    // Tests for promptInputNumber (mostly covered by above tests already)

    @Test
    fun `should ignore all input characters that are not numbers`() {
        var result: String

        testSession { terminal ->
            result = myPromptInputNumber(testMessage, onInputReady = {
                terminal.type("test 1, test 2; test 3.?/%!IV")
                terminal.press(Keys.ENTER)
            })
            assertThat(result).isEqualTo("123")
        }
    }

    //Tests for promptConfirm

    @Test
    fun `should correctly display all text formatting when prompt is first displayed`() {
        testSession { terminal ->
            myPromptConfirm(testMessage, testHint, onInputReady = {
                terminal.assertMatches {
                    bold {
                        green { text("? ") }; text(testMessage)
                        black(isBright = true) { textLine("  $testHint") }
                    }
                    text("> "); cyan { text("[Yes]") }; textLine(" No ")
                }
                terminal.press(Keys.ENTER)
            })
        }
    }

    @Test
    fun `should return true and display correct state when no arrow keys were pressed`() {
        var result: Boolean

        testSession { terminal ->
            result = myPromptConfirm(testMessage, onInputReady = {
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
            result = myPromptConfirm(testMessage, testHint, onInputReady = {
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
            result = myPromptConfirm(testMessage, onInputReady = {
                repeat(5) {
                    terminal.press(Keys.RIGHT)
                }
                terminal.press(Keys.LEFT)
                terminal.press(Keys.ENTER)
            })
            assertThat(result).isTrue()
        }
    }

    //Tests for promptList

    @Test
    fun `should display all list options that were specified in the correct format when prompt is first displayed`() {
        testSession { terminal ->
            myPromptList(testMessage, testChoices, testHint, onInputReady = {
                terminal.assertMatches {
                    bold { green { text("? ") }; text(testMessage); black(isBright = true) { textLine("  $testHint") } }
                    cyan(isBright = true) { text(" ❯ ") }; cyan { textLine(testChoices[0]) }
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
            result = myPromptList(testMessage, testChoices, onInputReady = {
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
    fun `should select the second list option when arrow down was pressed`() {
        var result: String

        testSession { terminal ->
            result = myPromptList(testMessage, testChoices, onInputReady = {
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
    fun `should select the last list option when arrow down was pressed more often than there are options`() {
        var result: String

        testSession { terminal ->
            result = myPromptList(testMessage, testChoices, onInputReady = {
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

    //Tests for promptCheckbox

    @Test
    fun `should display all checkbox options that were specified in the correct format when the first option is selected`() {
        testSession { terminal ->
            myPromptCheckbox(testMessage, testChoices, testHint, true, onInputReady = {
                terminal.press(Keys.SPACE)
                terminal.press(Keys.ENTER)
            })
            terminal.assertMatches {
                bold {
                    green { text("? ") }; text(testMessage)
                    black(isBright = true) { textLine("  $testHint  $emptySelectionAllowedMessage") }
                }
                cyan(isBright = true) { text(" ❯ ") }; green { text("◉ ") }; cyan { textLine(testChoices[0]) }
                for (testItem in testChoices.drop(1)) {
                    cyan(isBright = true) { text("   ") }; textLine("◯ $testItem")
                }
            }
        }
    }

    @Test
    fun `should return empty input when no input was selected and empty input is allowed`() {
        var result: List<String>
        val emptyList = listOf<String>()

        testSession { terminal ->
            result = myPromptCheckbox(testMessage, testChoices, testHint, allowEmptyInput = true, onInputReady = {
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
             myPromptCheckbox(testMessage, testChoices, testHint, allowEmptyInput = false,
                 onInputReady = {
                    terminal.press(Keys.ENTER)

                    try {               //TODO: check back if try catch block can be removed after dev answer
                        blockUntilRenderWhen {
                            terminal.resolveRerenders().stripFormatting() == listOf(
                                "? $testMessage  $emptySelectionNotAllowedMessage",
                                " ❯ ◯ element 0",
                                "   ◯ element 1",
                                "   ◯ element 2",
                                "   ◯ element 3",
                                ""
                            )
                        }
                    }
                    catch (ex: TimeoutCancellationException) {
                        throw AssertionError("Render did not match expected result!\n" + ex.printStackTrace())
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
            result = myPromptCheckbox(testMessage, testChoices, testHint, onInputReady = {
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
            result = myPromptCheckbox(testMessage, testChoices, testHint, onInputReady = {
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
    fun `should select last checkbox option when arrow down was pressed more often than there are options`() {
        var result: List<String>

        testSession { terminal ->
            result = myPromptCheckbox(testMessage, testChoices, testHint, onInputReady = {
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
            result = myPromptCheckbox(testMessage, testChoices, testHint, onInputReady = {
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
            result = myPromptCheckbox(testMessage, testChoices, testHint, onInputReady = {
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
