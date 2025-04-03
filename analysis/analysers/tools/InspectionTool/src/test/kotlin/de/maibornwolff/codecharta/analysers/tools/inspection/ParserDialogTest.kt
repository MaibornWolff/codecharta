package de.maibornwolff.codecharta.analysers.tools.inspection

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.tools.inspection.ParserDialog.Companion.collectParserArgs
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File

@Timeout(120)
class ParserDialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFileName = "${testResourceBaseFolder}sample_project.cc.json"

    @Test
    fun `should output correct arguments when print structure is selected`() {
        val level = 5

        mockkObject(ParserDialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val levelsCallback: suspend RunScope.() -> Unit = {
                terminal.type(level.toString())
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                levelsCallback
            )

            parserArguments = collectParserArgs(this)
        }

        val commandLine = CommandLine(InspectionTool())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().name)
            .isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedOption("levels").getValue<Int>())
            .isEqualTo(5)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = "inv"

        mockkObject(ParserDialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val levelsCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                levelsCallback
            )

            parserArguments = collectParserArgs(this)
        }

        val commandLine = CommandLine(InspectionTool())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().name)
            .isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedOption("levels").getValue<Int>())
            .isEqualTo(0)
    }
}
