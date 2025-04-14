package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.cyan
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.invert
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.resolveRerenders
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.runtime.blockUntilRenderWhen
import com.varabyte.kotterx.test.runtime.stripFormatting
import com.varabyte.kotterx.test.terminal.assertMatches
import de.maibornwolff.codecharta.serialization.FileExtension
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class DialogProviderTest {
    private val testInput = "this is text to simulate user input."

    private val testMessage = "this test message is displayed as the question."
    private val testHint = "this is displayed as the hint for a prompt."
    private val testInvalidInputMessage = "this is displayed as a message for invalid inputs."

    private val emptyInputAllowedMessage = "Empty input is allowed"
    private val emptyInputNotAllowedMessage = "Empty input is not allowed!"
    private val emptySelectionAllowedMessage = "Empty selection is allowed"
    private val emptySelectionNotAllowedMessage = "Empty selection is not allowed!"

    private val testChoices =
        listOf(
            "element 0",
            "element 1",
            "element 2",
            "element 3"
        )

    @Nested
    @DisplayName("promptInput > ")
    inner class PromptInputTests {
        // Tests for promptInput

        @Test
        fun `should correctly apply the text formatting when prompt is first displayed`() {
            testSession { terminal ->
                promptInput(testMessage, testHint, true, testInvalidInputMessage, onInputReady = {
                    terminal.assertMatches {
                        bold {
                            green { text("? ") }
                            text(testMessage)
                            black(isBright = true) { textLine("  $emptyInputAllowedMessage") }
                        }
                        text("> ")
                        black(isBright = true) {
                            invert { text("${testHint[0]}") }
                            text("${testHint.drop(1)} ")
                        }
                    }
                    terminal.press(Keys.ENTER)
                })
            }
        }

        @Test
        fun `should return user input when no validity checker was specified`() {
            var result: String

            testSession { terminal ->
                result =
                    promptInput(testMessage, onInputReady = {
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
                result =
                    promptInput(testMessage, allowEmptyInput = true, onInputReady = {
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
                promptInput(
                    testMessage,
                    allowEmptyInput = false,
                    onInputReady = {
                        terminal.press(Keys.ENTER)

                        blockUntilRenderWhen {
                            terminal.resolveRerenders().stripFormatting() ==
                                listOf(
                                    "? $testMessage  $emptyInputNotAllowedMessage",
                                    ">  ",
                                    ""
                                )
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
                result =
                    promptInput(testMessage, inputValidator = { true }, onInputReady = {
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
                result =
                    promptInput(testMessage, allowEmptyInput = true, inputValidator = { false }, onInputReady = {
                        terminal.press(Keys.ENTER)
                    })
                assertThat(result).isEqualTo("")
            }
        }

        @Test
        fun `should not accept input and display default warning message when input was invalid`() {
            testSession { terminal ->
                promptInput(
                    testMessage,
                    allowEmptyInput = false,
                    inputValidator = { input -> input.contains("accepted") },
                    onInputReady = {
                        terminal.type("x")
                        terminal.press(Keys.ENTER)

                        blockUntilRenderWhen {
                            terminal.resolveRerenders().stripFormatting() ==
                                listOf(
                                    "? $testMessage  Input is invalid!",
                                    "> x ",
                                    ""
                                )
                        }

                        terminal.type("accepted")
                        terminal.press(Keys.ENTER)
                    }
                )
            }
        }

        @Test
        fun `should not accept invalid input and display custom warning message when a custom invalid input message was specified`() {
            testSession { terminal ->
                promptInput(
                    testMessage,
                    allowEmptyInput = false,
                    invalidInputMessage = testInvalidInputMessage,
                    inputValidator = { input -> input.contains("accepted") },
                    onInputReady = {
                        terminal.type("x")
                        terminal.press(Keys.ENTER)

                        blockUntilRenderWhen {
                            terminal.resolveRerenders().stripFormatting() ==
                                listOf(
                                    "? $testMessage  $testInvalidInputMessage",
                                    "> x ",
                                    ""
                                )
                        }

                        terminal.type("accepted")
                        terminal.press(Keys.ENTER)
                    }
                )
            }
        }
    }

    @Nested
    @DisplayName("promptInputNumber > ")
    inner class PromptInputNumberTests {
        // Tests for promptInputNumber (mostly covered by above tests already)

        @Test
        fun `should ignore all input characters that are not numbers`() {
            var result: String

            testSession { terminal ->
                result =
                    promptInputNumber(testMessage, onInputReady = {
                        terminal.type("test 1, test 2; test 3.?/%!IV")
                        terminal.press(Keys.ENTER)
                    })
                assertThat(result).isEqualTo("123")
            }
        }

        @Test
        fun `should not accept input if invalid`() {
            var rendered: List<String> = listOf()
            testSession { terminal ->
                val result =
                    promptInputNumber(
                        testMessage,
                        invalidInputMessage = testInvalidInputMessage,
                        inputValidator = InputValidator.isNumberGreaterThen(
                            2
                        ),
                        onInputReady = {
                            terminal.type("1")
                            terminal.press(Keys.ENTER)

                            blockUntilRenderWhen {
                                rendered = terminal.resolveRerenders().stripFormatting()
                                rendered.any { it.contains(testInvalidInputMessage) }
                            }

                            terminal.press(Keys.BACKSPACE)
                            terminal.type("3")
                            terminal.press(Keys.ENTER)
                        }
                    )

                assertThat(rendered).isEqualTo(
                    listOf(
                        "? $testMessage  $testInvalidInputMessage",
                        "> 1 ",
                        ""
                    )
                )
                assertThat(result).isEqualTo("3")
            }
        }

        @Test
        fun `should accept empty number input`() {
            testSession { terminal ->
                val result = promptInputNumber(testMessage, allowEmptyInput = true, onInputReady = {
                    terminal.press(Keys.ENTER)
                })
                assertThat(result).isEqualTo("")
            }
        }

        @Test
        fun `should accept empty input but still check if valid`() {
            testSession { terminal ->
                val result =
                    promptInputNumber(
                        testMessage,
                        allowEmptyInput = true,
                        inputValidator = InputValidator.isNumberGreaterThen(
                            2
                        ),
                        onInputReady = {
                            terminal.type("1")
                            terminal.press(Keys.ENTER)
                            terminal.press(Keys.BACKSPACE)
                            terminal.press(Keys.ENTER)
                        }
                    )

                assertThat(result).isEqualTo("")
            }
        }
    }

    @Nested
    @DisplayName("promptConfirm > ")
    inner class PromptConfirmTests {
        // Tests for promptConfirm

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

    @Nested
    @DisplayName("promptList > ")
    inner class PromptListTests {
        // Tests for promptList

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

    @Nested
    @DisplayName("promptCheckbox > ")
    inner class PromptCheckboxTest {
        // Tests for promptCheckbox

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

    @Nested
    @DisplayName("defaultFileOrFolderInput > ")
    inner class DefaultFileOrFolderInputTests {
        // defaultFileOrFolderInput

        @Test
        fun `should prompt file type correctly`() {
            var result: String
            val testFilePath = "src/test/resources"
            val inputFileName = "$testFilePath/valid.log"
            val testMessage = "What is the input file."

            testSession { terminal ->
                result =
                    promptDefaultFileFolderInput(InputType.FILE, listOf(), onInputReady = {
                        terminal.type(inputFileName)
                        terminal.press(Keys.ENTER)
                    })
                assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                    "? $testMessage",
                    "> $inputFileName ",
                    ""
                )

                assertThat(result).isEqualTo(inputFileName)
            }
        }

        @Test
        fun `should prompt file extensions correctly`() {
            var result: String
            val testFilePath = "src/test/resources"
            val inputFileName = "$testFilePath/validExtension.cc.json"
            val testMessage = "What is the input [.cc.json] file."

            testSession { terminal ->
                result =
                    promptDefaultFileFolderInput(InputType.FILE, listOf(FileExtension.CCJSON), onInputReady = {
                        terminal.type(inputFileName)
                        terminal.press(Keys.ENTER)
                    })
                assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                    "? $testMessage",
                    "> $inputFileName ",
                    ""
                )

                assertThat(result).isEqualTo(inputFileName)
            }
        }

        @Test
        fun `should prompt plural if multiple is set`() {
            var result: String
            val testFilePath = "src/test/resources"
            val inputFileName = "$testFilePath/valid.log"
            val testMessage = "What are the input file(s). Enter multiple files comma separated."
            val multiTestHint = "input1, input2, ..."

            testSession { terminal ->
                result =
                    promptDefaultFileFolderInput(InputType.FILE, listOf(), multiple = true, onInputReady = {
                        terminal.assertMatches {
                            bold {
                                green { text("? ") }
                                textLine(testMessage)
                            }
                            text("> ")
                            black(isBright = true) {
                                invert { text(multiTestHint[0]) }
                                text("${multiTestHint.drop(1)} ")
                            }
                        }
                        terminal.type(inputFileName)
                        terminal.press(Keys.ENTER)
                    })
                assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                    "? $testMessage",
                    "> $inputFileName ",
                    ""
                )

                assertThat(result).isEqualTo(inputFileName)
            }
        }

        @Test
        fun `should prompt plural if multiple is set with file extension`() {
            var result: String
            val testFilePath = "src/test/resources"
            val inputFileName = "$testFilePath/validExtension.cc.json"
            val testMessage = "What are the input [.cc.json] file(s). Enter multiple files comma separated."
            val multiTestHint = "input1.cc.json, input2.cc.json, ..."

            testSession { terminal ->
                result =
                    promptDefaultFileFolderInput(InputType.FILE, listOf(FileExtension.CCJSON), multiple = true, onInputReady = {
                        terminal.assertMatches {
                            bold {
                                green { text("? ") }
                                textLine(testMessage)
                            }
                            text("> ")
                            black(isBright = true) {
                                invert { text(multiTestHint[0]) }
                                text("${multiTestHint.drop(1)} ")
                            }
                        }
                        terminal.type(inputFileName)
                        terminal.press(Keys.ENTER)
                    })
                assertThat(terminal.resolveRerenders().stripFormatting()).containsExactly(
                    "? $testMessage",
                    "> $inputFileName ",
                    ""
                )

                assertThat(result).isEqualTo(inputFileName)
            }
        }
    }
}
