package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
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
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DialogProviderPromptInputTest : DialogProviderTestBase() {
    private val testInput = "this is text to simulate user input."

    private val testInvalidInputMessage = "this is displayed as a message for invalid inputs."

    private val emptyInputAllowedMessage = "Empty input is allowed"

    private val emptyInputNotAllowedMessage = "Empty input is not allowed!"

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
