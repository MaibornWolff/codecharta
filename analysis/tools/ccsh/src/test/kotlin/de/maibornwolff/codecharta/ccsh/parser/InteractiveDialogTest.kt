package de.maibornwolff.codecharta.ccsh.parser

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.applicableCallback
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askApplicableParser
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askForMerge
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askForPath
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askJsonPath
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askParserToExecute
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askRunParsers
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.jsonCallback
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.mergeCallback
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.parserCallback
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.pathCallback
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.runCallback
import io.mockk.every
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
            every { parserCallback() } returns {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }

            val result = askParserToExecute(listOf(option1, option2))

            assertThat(result).isEqualTo(option2)
        }
    }

    @Test
    fun `should ask for a path via string input`() {
        val someInput = "someInput"

        testSession { terminal ->
            every { pathCallback() } returns {
                terminal.type(someInput)
                terminal.press(Keys.ENTER)
            }

            val result = askForPath()

            assertThat(result).isEqualTo(someInput)
        }
    }

    @Test
    fun `should ask for applicable parsers`() {
        val option1 = "option1"
        val option2 = "option2"

        testSession { terminal ->
            every { applicableCallback() } returns {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.SPACE)
                terminal.press(Keys.ENTER)
            }

            val result = askApplicableParser(listOf(option1, option2))

            assertThat(result[0]).isEqualTo(option2)
        }
    }

    @Test
    fun `should ask for confirmation`() {
        testSession { terminal ->
            every { runCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val result = askRunParsers()

            assertThat(result).isFalse()
        }
    }

    @Test
    fun `should ask for merge`() {
        testSession { terminal ->
            every { mergeCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val result = askForMerge()

            assertThat(result).isFalse()
        }
    }

    @Test
    fun `should ask for a json path via string input`() {
        val someInput = "src/test/resources/mergefiles"

        testSession { terminal ->
            every { jsonCallback() } returns {
                terminal.type(someInput)
                terminal.press(Keys.ENTER)
            }

            val result = askJsonPath()

            assertThat(result).isEqualTo(someInput)
        }
    }
}
