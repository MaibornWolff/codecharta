package de.maibornwolff.codecharta.dialogProvider

import com.varabyte.kotter.foundation.input.Key
import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.foundation.text.black
import com.varabyte.kotter.foundation.text.bold
import com.varabyte.kotter.foundation.text.cyan
import com.varabyte.kotter.foundation.text.green
import com.varabyte.kotter.foundation.text.text
import com.varabyte.kotter.foundation.text.textLine
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.runtime.blockUntilRenderWhen
import com.varabyte.kotterx.test.terminal.assertMatches
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.EMPTY_SELECTION_ALLOWED_MESSAGE
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.EMPTY_SELECTION_NOT_ALLOWED_MESSAGE
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.TEST_CHOICES
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.TEST_HINT
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.TEST_MESSAGE
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.pressEach
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.renderedLines
import de.maibornwolff.codecharta.dialogProvider.PromptTestFixtures.repeatKey
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PromptCheckboxTest {
    private fun checkboxLines(cursorIndex: Int, selectedIndices: Set<Int>): List<String> = TEST_CHOICES.mapIndexed { index, choice ->
        val cursor = if (index == cursorIndex) " ❯ " else "   "
        val checkbox = if (index in selectedIndices) "◉" else "◯"
        "$cursor$checkbox $choice"
    } + ""

    @Test
    fun `should display all checkbox options that were specified in the correct format when the first option is selected`() {
        testSession { terminal ->
            // Act
            promptCheckbox(TEST_MESSAGE, TEST_CHOICES, TEST_HINT, true, onInputReady = {
                terminal.press(Keys.SPACE)
                terminal.press(Keys.ENTER)
            })

            // Assert
            terminal.assertMatches {
                bold {
                    green { text("? ") }
                    text(TEST_MESSAGE)
                    black(isBright = true) { textLine("  $TEST_HINT  $EMPTY_SELECTION_ALLOWED_MESSAGE") }
                }
                cyan(isBright = true) { text(" ❯ ") }
                green { text("◉ ") }
                cyan { textLine(TEST_CHOICES[0]) }
                for (testItem in TEST_CHOICES.drop(1)) {
                    cyan(isBright = true) { text("   ") }
                    textLine("◯ $testItem")
                }
            }
        }
    }

    @Test
    fun `should return empty input when no input was selected and empty input is allowed`() {
        testSession { terminal ->
            // Act
            val result = promptCheckbox(TEST_MESSAGE, TEST_CHOICES, TEST_HINT, allowEmptyInput = true, onInputReady = {
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(terminal.renderedLines()).containsExactlyElementsOf(
                listOf("? $TEST_MESSAGE  $TEST_HINT  $EMPTY_SELECTION_ALLOWED_MESSAGE") + checkboxLines(0, emptySet())
            )
            assertThat(result).isEmpty()
        }
    }

    @Test
    fun `should not accept input and display hint when selection is empty and empty input is not allowed`() {
        testSession { terminal ->
            // Act
            promptCheckbox(TEST_MESSAGE, TEST_CHOICES, TEST_HINT, allowEmptyInput = false, onInputReady = {
                terminal.press(Keys.ENTER)

                // Assert
                blockUntilRenderWhen {
                    terminal.renderedLines() ==
                        listOf("? $TEST_MESSAGE  $EMPTY_SELECTION_NOT_ALLOWED_MESSAGE") + checkboxLines(0, emptySet())
                }

                terminal.press(Keys.SPACE)
                terminal.press(Keys.ENTER)
            })
        }
    }

    private fun selectionCases(): List<Arguments> = listOf(
        argumentSet("first option when no arrow keys were pressed", listOf(Keys.SPACE), 0, setOf(0)),
        argumentSet("second option when arrow down was pressed", listOf(Keys.DOWN, Keys.SPACE), 1, setOf(1)),
        argumentSet(
            "third option when space, arrow down and up were pressed mixed",
            repeatKey(Keys.SPACE, 2) + repeatKey(Keys.UP, 5) + Keys.DOWN + Keys.UP + repeatKey(Keys.DOWN, 2) + repeatKey(Keys.SPACE, 3),
            2,
            setOf(2)
        ),
        argumentSet(
            "last option when arrow down was pressed more often than there are options",
            repeatKey(Keys.DOWN, 6) + Keys.SPACE,
            3,
            setOf(3)
        ),
        argumentSet(
            "selected option when the cursor was moved afterwards",
            listOf(Keys.DOWN, Keys.DOWN, Keys.SPACE, Keys.UP),
            1,
            setOf(2)
        ),
        argumentSet(
            "all selected options when multiple were selected",
            listOf(Keys.SPACE, Keys.DOWN, Keys.SPACE, Keys.DOWN, Keys.DOWN, Keys.SPACE),
            3,
            setOf(0, 1, 3)
        )
    )

    @ParameterizedTest
    @MethodSource("selectionCases")
    fun `should return the selected options`(keys: List<Key>, expectedCursorIndex: Int, expectedSelectedIndices: Set<Int>) {
        // Arrange
        val expectedSelection = expectedSelectedIndices.sorted().map { TEST_CHOICES[it] }

        testSession { terminal ->
            // Act
            val result = promptCheckbox(TEST_MESSAGE, TEST_CHOICES, TEST_HINT, onInputReady = {
                terminal.pressEach(keys)
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(terminal.renderedLines()).containsExactlyElementsOf(
                listOf("? $TEST_MESSAGE  $TEST_HINT") + checkboxLines(expectedCursorIndex, expectedSelectedIndices)
            )
            assertThat(result).isEqualTo(expectedSelection)
        }
    }
}
