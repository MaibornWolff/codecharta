package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.invert
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.runtime.blockUntilRenderWhen
import com.varabyte.kotterx.test.terminal.assertMatches
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.EMPTY_INPUT_ALLOWED_MESSAGE
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.EMPTY_INPUT_NOT_ALLOWED_MESSAGE
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.TEST_HINT
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.TEST_INPUT
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.TEST_INVALID_INPUT_MESSAGE
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.TEST_MESSAGE
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.renderedLines
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PromptInputTest {
    private val acceptsOnlyAccepted: (String) -> Boolean = { input -> input.contains("accepted") }

    @Test
    fun `should correctly apply the text formatting when prompt is first displayed`() {
        testSession { terminal ->
            // Act
            promptInput(TEST_MESSAGE, TEST_HINT, true, TEST_INVALID_INPUT_MESSAGE, onInputReady = {
                // Assert
                terminal.assertMatches {
                    bold {
                        green { text("? ") }
                        text(TEST_MESSAGE)
                        black(isBright = true) { textLine("  $EMPTY_INPUT_ALLOWED_MESSAGE") }
                    }
                    text("> ")
                    black(isBright = true) {
                        invert { text("${TEST_HINT[0]}") }
                        text("${TEST_HINT.drop(1)} ")
                    }
                }
                terminal.press(Keys.ENTER)
            })
        }
    }

    private fun acceptedInputCases(): List<Arguments> = listOf(
        argumentSet("user input when the default validity checker is used", false, { _: String -> true }, TEST_INPUT),
        argumentSet(
            "user input when the specified validity checker accepts it",
            false,
            { input: String -> input == TEST_INPUT },
            TEST_INPUT
        ),
        argumentSet("empty input when the option to allow empty input was set", true, { _: String -> true }, ""),
        argumentSet("empty input when empty input is allowed but the validity checker would reject it", true, { _: String -> false }, "")
    )

    @ParameterizedTest
    @MethodSource("acceptedInputCases")
    fun `should return the entered input when it is accepted`(
        allowEmptyInput: Boolean,
        inputValidator: (String) -> Boolean,
        input: String
    ) {
        // Arrange
        val expectedHeader = if (allowEmptyInput) "? $TEST_MESSAGE  $EMPTY_INPUT_ALLOWED_MESSAGE" else "? $TEST_MESSAGE"

        testSession { terminal ->
            // Act
            val result = promptInput(TEST_MESSAGE, allowEmptyInput = allowEmptyInput, inputValidator = inputValidator, onInputReady = {
                terminal.type(input)
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(terminal.renderedLines()).containsExactly(expectedHeader, "> $input ", "")
            assertThat(result).isEqualTo(input)
        }
    }

    private fun rejectedInputCases(): List<Arguments> = listOf(
        argumentSet(
            "empty input when empty input is not allowed",
            DEFAULT_INVALID_INPUT_MESSAGE,
            { _: String -> true },
            "",
            EMPTY_INPUT_NOT_ALLOWED_MESSAGE
        ),
        argumentSet(
            "invalid input with the default warning message",
            DEFAULT_INVALID_INPUT_MESSAGE,
            acceptsOnlyAccepted,
            "x",
            DEFAULT_INVALID_INPUT_MESSAGE
        ),
        argumentSet(
            "invalid input with a custom warning message",
            TEST_INVALID_INPUT_MESSAGE,
            acceptsOnlyAccepted,
            "x",
            TEST_INVALID_INPUT_MESSAGE
        )
    )

    @ParameterizedTest
    @MethodSource("rejectedInputCases")
    fun `should not accept input and display a warning message when input is rejected`(
        invalidInputMessage: String,
        inputValidator: (String) -> Boolean,
        rejectedInput: String,
        expectedWarning: String
    ) {
        testSession { terminal ->
            // Act
            promptInput(
                TEST_MESSAGE,
                allowEmptyInput = false,
                invalidInputMessage = invalidInputMessage,
                inputValidator = inputValidator,
                onInputReady = {
                    terminal.type(rejectedInput)
                    terminal.press(Keys.ENTER)

                    // Assert
                    blockUntilRenderWhen {
                        terminal.renderedLines() == listOf("? $TEST_MESSAGE  $expectedWarning", "> $rejectedInput ", "")
                    }

                    terminal.type("accepted")
                    terminal.press(Keys.ENTER)
                }
            )
        }
    }
}
