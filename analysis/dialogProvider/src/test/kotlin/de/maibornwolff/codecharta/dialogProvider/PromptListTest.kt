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
import com.varabyte.kotterx.test.terminal.assertMatches
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
class PromptListTest {
    @Test
    fun `should display all list options that were specified in the correct format when prompt is first displayed`() {
        testSession { terminal ->
            // Act
            promptList(TEST_MESSAGE, TEST_CHOICES, TEST_HINT, onInputReady = {
                // Assert
                terminal.assertMatches {
                    bold {
                        green { text("? ") }
                        text(TEST_MESSAGE)
                        black(isBright = true) { textLine("  $TEST_HINT") }
                    }
                    cyan(isBright = true) { text(" ❯ ") }
                    cyan { textLine(TEST_CHOICES[0]) }
                    for (testItem in TEST_CHOICES.drop(1)) {
                        textLine("   $testItem")
                    }
                }
                terminal.press(Keys.ENTER)
            })
        }
    }

    private fun navigationCases(): List<Arguments> = listOf(
        argumentSet("first option when no arrow keys were pressed", emptyList<Key>(), 0),
        argumentSet("second option when arrow down was pressed once", listOf(Keys.DOWN), 1),
        argumentSet(
            "third option when arrow up was pressed in first position",
            repeatKey(Keys.UP, 5) + Keys.DOWN + Keys.UP + repeatKey(Keys.DOWN, 2),
            2
        ),
        argumentSet("last option when arrow down was pressed more often than there are options", repeatKey(Keys.DOWN, 6), 3)
    )

    @ParameterizedTest
    @MethodSource("navigationCases")
    fun `should select the option the cursor was moved to`(arrowKeys: List<Key>, expectedIndex: Int) {
        // Arrange
        val expectedOptionLines = TEST_CHOICES.mapIndexed { index, choice -> if (index == expectedIndex) " ❯ $choice" else "   $choice" }

        testSession { terminal ->
            // Act
            val result = promptList(TEST_MESSAGE, TEST_CHOICES, onInputReady = {
                terminal.pressEach(arrowKeys)
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(terminal.renderedLines()).containsExactlyElementsOf(
                listOf("? $TEST_MESSAGE  arrow keys to move, ENTER to select") + expectedOptionLines + ""
            )
            assertThat(result).isEqualTo(TEST_CHOICES[expectedIndex])
        }
    }
}
