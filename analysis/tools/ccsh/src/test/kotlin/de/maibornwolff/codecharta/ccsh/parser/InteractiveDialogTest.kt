package de.maibornwolff.codecharta.ccsh.parser

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askApplicableParser
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askForMerge
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askForPath
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askJsonPath
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askParserToExecute
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askRunParsers
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout

@Timeout(120)
class InteractiveDialogTest {
    @Test
    fun `should let user choose string from list`() {
        val option1 = "option1"
        val option2 = "option2"

        testSession { terminal ->
            val result = askParserToExecute(listOf(option1, option2)) {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }

            assertThat(result).isEqualTo(option2)
        }
    }

    @Test
    fun `should ask for a path via string input`() {
        val someInput = "someInput"

        testSession { terminal ->
            val result = askForPath {
                terminal.type(someInput)
                terminal.press(Keys.ENTER)
            }

            assertThat(result).isEqualTo(someInput)
        }
    }

    @Test
    fun `should ask for applicable parsers`() {
        val option1 = "option1"
        val option2 = "option2"

        testSession { terminal ->
            val result = askApplicableParser(listOf(option1, option2)) {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.SPACE)
                terminal.press(Keys.ENTER)
            }

            assertThat(result[0]).isEqualTo(option2)
        }
    }

    @Test
    fun `should ask for confirmation`() {
        testSession { terminal ->
            val result = askRunParsers {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            assertThat(result).isFalse()
        }
    }

    @Test
    fun `should ask for merge`() {
        testSession { terminal ->
            val result = askForMerge {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            assertThat(result).isFalse()
        }
    }

    @Test
    fun `should ask for a json path via string input`() {
        val someInput = "src/test/resources/mergefiles"

        testSession { terminal ->
            val result = askJsonPath {
                terminal.type(someInput)
                terminal.press(Keys.ENTER)
            }

            assertThat(result).isEqualTo(someInput)
        }
    }
}
