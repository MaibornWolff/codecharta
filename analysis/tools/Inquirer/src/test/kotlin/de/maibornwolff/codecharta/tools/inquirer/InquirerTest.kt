package de.maibornwolff.codecharta.tools.inquirer

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.cyan
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotterx.test.foundation.input.press
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.runtime.stripFormatting
import com.varabyte.kotterx.test.terminal.assertMatches
import com.varabyte.kotterx.test.terminal.resolveRerenders
import com.varabyte.kotterx.test.terminal.type
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class InquirerTest {

    private val testInput = "this is text to simulate user input."

    private val testMessage = "this test message is displayed as the question."
    private val testHint = "this is displayed as the hint for a prompt."
    private val testInvalidInputMessage = "this is displayed as a message for invalid inputs."

    private val testChoices = listOf(
            "element 0",
            "element 1",
            "element 2",
            "element 3"
    )

    private fun addBlinkingCursorOnFirstLetter(text: String): String {
        val ansiEscapeSequenceForInverseMode = "\\e[7m"
        val ansiResetSequenceForInverseMode = "\\e[27m"
        return ansiEscapeSequenceForInverseMode + text[0] + ansiResetSequenceForInverseMode + text.drop(1)
    }

    // Tests for promptInput TODO: test to correctly display a custom invalidInput message

    @Test       //TODO: fix
    fun `should correctly apply the text formatting when no user input was typed yet`() { //TODO: change name
        testSession { terminal ->
            myPromptInput(testMessage, testHint, true, testInvalidInputMessage, onInputReady = {
                terminal.assertMatches {
                    bold {
                        green { text("? ") }; text(testMessage)
                        black(isBright = true) { textLine("  empty input is allowed") }
                    }
                    text("> "); black(isBright = true) { text(addBlinkingCursorOnFirstLetter("$testHint ")) }
                }


                terminal.press(Keys.ENTER)
            })
        }

//        testSession { terminal ->
//            myPromptInput(testMessage, testInputHint, true, testInvalidInputMessage, onInputReady = {
//                assertThat(terminal.resolveRerenders()).containsExactly(
//                    bold {
//                        green { text("? ") }; text(testMessage)
//                        black(isBright = true) { textLine("  empty input is allowed") }
//                    }
//                    text("> "); black(isBright = true) { text(addBlinkingCursorOnFirstLetter("$testInputHint ")) }
//                )
//
//
//                terminal.press(Keys.ENTER)
//                println(terminal.resolveRerenders())
//            })
//        }
    }

    @Test
    fun `should return user input when no validity checker was specified`() {
        var result = ""

        testSession { terminal ->
            result = myPromptInput(testMessage, onInputReady = {
                terminal.type(testInput)
                terminal.press(Keys.ENTER)
            })

            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                    "? $testMessage",
                    "> $testInput ",        //TODO: schauen ob wir das leerzeichen am ende wegbekommen
                    ""
            )
        }

        assertThat(result).isEqualTo(testInput)
    }

    @Test
    fun `should return empty input when the option to allow empty input was set`() {
        var result = "not empty"

        testSession { terminal ->
            result = myPromptInput(testMessage, allowEmptyInput = true, onInputReady = {
                terminal.press(Keys.ENTER)


                assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                        "? $testMessage  empty input is allowed",
                        ">  ",
                        ""
                )
            })
        }
        assertThat(result).isEqualTo("")
    }

    @Test       //TODO: Fix
    fun `should not accept input and display error when input is empty but empty input is not allowed`() {
        var result = "not empty"

        testSession { terminal ->
            result = myPromptInput(testMessage, allowEmptyInput = false,
                    onInputReady = {
                        terminal.press(Keys.ENTER)

                        terminal.assertMatches { textLine(/* expected result */) }
                   }
            )
        }
        assertThat(result).isEqualTo("")
    }

    @Test
    fun `should return valid input when a validity checker was specified and input is valid`() {
        var result = ""
        // mock inputValidator to return true -> or do we just define a new one here?

        testSession { terminal ->
            result = myPromptInput(testMessage, inputValidator = { true }, onInputReady = {
                terminal.type(testInput)
                terminal.press(Keys.ENTER)
            })
        }
        assertThat(result).isEqualTo(testInput)
    }

    @Test
    fun `should not accept input and display error when a validity checker was specified but input was invalid`() {
        assertThat(false).isTrue() //write test
    }

    @Test
    fun `should not accept input and display custom error when an invalidInputMessage and a validity checker were set`() {
        assertThat(false).isTrue() //write test
    }

    // Tests for promptInputNumber

    @Test
    fun `should ignore all input characters that are not numbers`() {
        var result = ""

        testSession { terminal ->
            result = myPromptInputNumber(testMessage, onInputReady = {
                terminal.type("test 1, test 2; test 3.?/%!")
                terminal.press(Keys.ENTER)
            })
        }
        assertThat(result).isEqualTo("123")
    }

//    @Test
//    fun `should return empty number input when the option to allow empty input was set`() {
//
//    }
    //TODO: add more tests after refactor


    //Tests for promptConfirm

    @Test
    fun `should correctly display all text formatting when all style changing parameters are set`() {
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
        var result = false

        testSession { terminal ->
            result = myPromptConfirm(testMessage, onInputReady = {
                terminal.press(Keys.ENTER)
            })

            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                    "? $testMessage  arrow keys to change selection",
                    "> [Yes] No ",
                    ""
            )
        }

        assertThat(result).isTrue()
    }

    @Test
    fun `should return false and display correct state when right arrow key was pressed`() {
        var result = true

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
        }
        assertThat(result).isFalse()
    }

    @Test
    fun `should correctly return when arrow keys were pressed multiple times`() {
        var result = false

        testSession { terminal ->
            result = myPromptConfirm(testMessage, onInputReady = {
                repeat(5) {
                    terminal.press(Keys.RIGHT)
                }
                terminal.press(Keys.LEFT)
                terminal.press(Keys.ENTER)
            })
        }
        assertThat(result).isTrue()
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
        var result = ""

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
        }
        assertThat(result).isEqualTo(testChoices[0])
    }

    @Test
    fun `should select the second list option when arrow down was pressed`() {
        var result = ""

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
        }
        assertThat(result).isEqualTo(testChoices[1])
    }

    @Test
    fun `should select the last list option when arrow down was pressed more often than there are options`() {
        var result = ""

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
        }
        assertThat(result).isEqualTo(testChoices.last())
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
                    black(isBright = true) { textLine("  $testHint  empty selection is allowed") }
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
        var result = listOf("not", "empty")
        val emptyList = listOf<String>()

        testSession { terminal ->
            result = myPromptCheckbox(testMessage, testChoices, testHint, allowEmptyInput = true, onInputReady = {
                terminal.press(Keys.ENTER)
            })
            assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                    "? $testMessage  $testHint  empty selection is allowed",
                    " ❯ ◯ element 0",
                    "   ◯ element 1",
                    "   ◯ element 2",
                    "   ◯ element 3",
                    ""
            )
        }
        assertThat(result).isEqualTo(emptyList)
    }

    @Test       //TODO: same problem as for input with the blocking function
    fun `should not accept input and display hint when selection is empty and the option for empty input was not set`() {
        assertThat(false).isTrue() //write test
    }

    @Test
    fun `should select the first checkbox option when no arrow keys were pressed`() {
        var result = listOf<String>()

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
        }

        assertThat(result).isEqualTo(listOf(testChoices[0]))
    }

    @Test
    fun `should select the second checkbox option when arrow down was pressed`() {
        var result = listOf<String>()

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
        }

        assertThat(result).isEqualTo(listOf(testChoices[1]))
    }

    @Test
    fun `should select last checkbox option when arrow down was pressed more often than there are options`() {
        var result = listOf<String>()

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
        }

        assertThat(result).isEqualTo(listOf(testChoices.last()))
    }

    @Test
    fun `should select correct element when selection was made and cursor was moved afterwards`() {
        var result = listOf<String>()

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
        }

        assertThat(result).isEqualTo(listOf(testChoices[2]))
    }

    @Test
    fun `should return all selected options when multiple were selected`() {
        var result = listOf<String>()
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
        }
        assertThat(result).isEqualTo(elemsToSelect)
    }
}
