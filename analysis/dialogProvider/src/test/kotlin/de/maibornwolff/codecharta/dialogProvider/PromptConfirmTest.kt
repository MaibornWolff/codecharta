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
class PromptConfirmTest {
    private val defaultHeader = "? $TEST_MESSAGE  arrow keys to change selection"
    private val yesSelectedLine = "> [Yes] No "
    private val noSelectedLine = ">  Yes [No]"

    @Test
    fun `should correctly display all text formatting when prompt is first displayed`() {
        testSession { terminal ->
            // Act
            promptConfirm(TEST_MESSAGE, TEST_HINT, onInputReady = {
                // Assert
                terminal.assertMatches {
                    bold {
                        green { text("? ") }
                        text(TEST_MESSAGE)
                        black(isBright = true) { textLine("  $TEST_HINT") }
                    }
                    text("> ")
                    cyan { text("[Yes]") }
                    textLine(" No ")
                }
                terminal.press(Keys.ENTER)
            })
        }
    }

    private fun arrowKeyCases(): List<Arguments> = listOf(
        argumentSet("no arrow keys pressed selects yes", emptyList<Key>(), yesSelectedLine, true),
        argumentSet("right arrow key selects no", listOf(Keys.RIGHT), noSelectedLine, false),
        argumentSet("arrow keys pressed multiple times end on yes", repeatKey(Keys.RIGHT, 5) + Keys.LEFT, yesSelectedLine, true)
    )

    @ParameterizedTest
    @MethodSource("arrowKeyCases")
    fun `should return the selected choice and display the correct state after arrow keys were pressed`(
        arrowKeys: List<Key>,
        expectedSelectionLine: String,
        expectedResult: Boolean
    ) {
        testSession { terminal ->
            // Act
            val result = promptConfirm(TEST_MESSAGE, onInputReady = {
                terminal.pressEach(arrowKeys)
                terminal.press(Keys.ENTER)
            })

            // Assert
            assertThat(terminal.renderedLines()).containsExactly(defaultHeader, expectedSelectionLine, "")
            assertThat(result).isEqualTo(expectedResult)
        }
    }
}
