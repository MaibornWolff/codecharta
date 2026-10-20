package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.resolveRerenders
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.runtime.blockUntilRenderWhen
import com.varabyte.kotterx.test.runtime.stripFormatting
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DialogProviderPromptInputNumberTest : DialogProviderTestBase() {
    private val testInvalidInputMessage = "this is displayed as a message for invalid inputs."

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
