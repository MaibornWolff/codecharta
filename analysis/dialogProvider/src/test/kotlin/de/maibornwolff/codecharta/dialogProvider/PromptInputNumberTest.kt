package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.runtime.blockUntilRenderWhen
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.TEST_INVALID_INPUT_MESSAGE
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.TEST_MESSAGE
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.renderedLines
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PromptInputNumberTest {
    @Test
    fun `should ignore all input characters that are not numbers`() {
        testSession { terminal ->
            // Act
            val result = promptInputNumber(TEST_MESSAGE, onInputReady = {
                terminal.type("test 1, test 2; test 3.?/%!IV")
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(result).isEqualTo("123")
        }
    }

    @Test
    fun `should not accept input if invalid`() {
        // Arrange
        var rendered: List<String> = listOf()

        testSession { terminal ->
            // Act
            val result = promptInputNumber(
                TEST_MESSAGE,
                invalidInputMessage = TEST_INVALID_INPUT_MESSAGE,
                inputValidator = InputValidator.isNumberGreaterThen(2),
                onInputReady = {
                    terminal.type("1")
                    terminal.press(Keys.ENTER)

                    blockUntilRenderWhen {
                        rendered = terminal.renderedLines()
                        rendered.any { it.contains(TEST_INVALID_INPUT_MESSAGE) }
                    }

                    terminal.press(Keys.BACKSPACE)
                    terminal.type("3")
                    terminal.press(Keys.ENTER)
                }
            )

            // Assert
            assertThat(rendered).isEqualTo(listOf("? $TEST_MESSAGE  $TEST_INVALID_INPUT_MESSAGE", "> 1 ", ""))
            assertThat(result).isEqualTo("3")
        }
    }

    @Test
    fun `should accept empty number input`() {
        testSession { terminal ->
            // Act
            val result = promptInputNumber(TEST_MESSAGE, allowEmptyInput = true, onInputReady = {
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(result).isEqualTo("")
        }
    }

    @Test
    fun `should accept empty input but still check if valid`() {
        testSession { terminal ->
            // Act
            val result = promptInputNumber(
                TEST_MESSAGE,
                allowEmptyInput = true,
                inputValidator = InputValidator.isNumberGreaterThen(2),
                onInputReady = {
                    terminal.type("1")
                    terminal.press(Keys.ENTER)
                    terminal.press(Keys.BACKSPACE)
                    terminal.press(Keys.ENTER)
                }
            )

            // Assert
            assertThat(result).isEqualTo("")
        }
    }
}
