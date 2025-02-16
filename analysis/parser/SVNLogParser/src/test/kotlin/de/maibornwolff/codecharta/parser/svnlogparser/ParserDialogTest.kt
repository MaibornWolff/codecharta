package de.maibornwolff.codecharta.parser.svnlogparser

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.parser.svnlogparser.ParserDialog.Companion.collectParserArgs
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFileName = "${testResourceBaseFolder}example_svn.log"
    private val outputFileName = "out.cc.json"

    @Test
    fun `should output correct arguments when valid input is provided`() {
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->

            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.silentCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.authorCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val cmdLine = CommandLine(SVNLogParser())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
            assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = "inv"
        val isSilent = true
        val addAuthor = true

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.silentCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.authorCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val cmdLine = CommandLine(SVNLogParser())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
            assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
        }
    }
}
