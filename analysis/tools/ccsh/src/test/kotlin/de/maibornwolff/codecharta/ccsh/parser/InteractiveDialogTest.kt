package de.maibornwolff.codecharta.ccsh.parser

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askApplicableParser
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askForMerge
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askForPath
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askJsonPath
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askParserToExecute
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog.Companion.askRunParsers
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout

@Timeout(120)
class InteractiveDialogTest {
    @BeforeEach
    fun setup() {
        mockkObject(InteractiveDialog)
    }

    @Test
    fun `should let user choose string from list`() {
        val option1 = "option1"
        val option2 = "option2"

        testSession { terminal ->
            val parserCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }

            every { InteractiveDialog.Companion.testCallback() } returnsMany listOf(
                parserCallback
            )

            val result = askParserToExecute(this, listOf(option1, option2))

            assertThat(result).isEqualTo(option2)
        }
    }

    @Test
    fun `should ask for a path via string input`() {
        val someInput = "someInput"

        testSession { terminal ->
            val pathCallback: suspend RunScope.() -> Unit = {
                terminal.type(someInput)
                terminal.press(Keys.ENTER)
            }

            every { InteractiveDialog.Companion.testCallback() } returnsMany listOf(
                pathCallback
            )

            val result = askForPath(this)

            assertThat(result).isEqualTo(someInput)
        }
    }

    @Test
    fun `should ask for applicable parsers`() {
        val option1 = "option1"
        val option2 = "option2"

        testSession { terminal ->
            val applicableCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.SPACE)
                terminal.press(Keys.ENTER)
            }

            every { InteractiveDialog.Companion.testCallback() } returnsMany listOf(
                applicableCallback
            )

            val result = askApplicableParser(this, listOf(option1, option2))

            assertThat(result[0]).isEqualTo(option2)
        }
    }

    @Test
    fun `should ask for confirmation`() {
        testSession { terminal ->
            val runCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { InteractiveDialog.Companion.testCallback() } returnsMany listOf(
                runCallback
            )

            val result = askRunParsers(this)

            assertThat(result).isFalse()
        }
    }

    @Test
    fun `should ask for merge`() {
        testSession { terminal ->
            val mergeCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { InteractiveDialog.Companion.testCallback() } returnsMany listOf(
                mergeCallback
            )

            val result = askForMerge(this)

            assertThat(result).isFalse()
        }
    }

    @Test
    fun `should ask for a json path via string input`() {
        val someInput = "src/test/resources/mergefiles"

        testSession { terminal ->
            val jsonCallback: suspend RunScope.() -> Unit = {
                terminal.type(someInput)
                terminal.press(Keys.ENTER)
            }

            every { InteractiveDialog.Companion.testCallback() } returnsMany listOf(
                jsonCallback
            )

            val result = askJsonPath(this)

            assertThat(result).isEqualTo(someInput)
        }
    }
}
