package de.maibornwolff.codecharta.parser.sourcecodeparser

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.parser.sourcecodeparser.ParserDialog.Companion.collectParserArgs
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
    private val inputFileName = "${testResourceBaseFolder}ScriptShellSample.java"
    private val inputFileFolder = "${testResourceBaseFolder}my/"
    private val outputFileName = "out.cc.json"

    @Test
    fun `should output correct arguments when valid input is provided`() {
        val outputFormat = OutputFormat.JSON
        val defaultExcludes = true
        val isCompressed = false
        val isVerbose = true

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->

            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(inputFileFolder)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.formatCallback() } returns {
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
            every { ParserDialog.Companion.issueCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.defaultCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.excludeCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.verboseCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val cmdLine = CommandLine(SourceCodeParserMain())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileFolder).name)
            assertThat(parseResult.matchedOption("format").getValue<OutputFormat>()).isEqualTo(outputFormat)
            assertThat(parseResult.matchedOption("output-file").getValue<File>().name).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("exclude")).isNull()
            assertThat(parseResult.matchedOption("no-issues")).isNull()
            assertThat(parseResult.matchedOption("default-excludes").getValue<Boolean>())
                .isEqualTo(defaultExcludes)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isEqualTo(isVerbose)
        }
    }

    @Test
    fun `should output correct arguments when multiple exclude patterns are specified`() {
        val outputFormat = OutputFormat.CSV
        val outputFileName = "output.csv"
        val excludes = "ex1, ex2"
        val excludeArray = arrayOf("ex1", "ex2")
        val findIssues = false

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.formatCallback() } returns {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.issueCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.defaultCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.excludeCallback() } returns {
                terminal.type(excludes)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.verboseCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val cmdLine = CommandLine(SourceCodeParserMain())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("format").getValue<OutputFormat>()).isEqualTo(outputFormat)
            assertThat(parseResult.matchedOption("output-file").getValue<File>().name).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("exclude").getValue<Array<String>>()).containsExactly(*excludeArray)
            assertThat(parseResult.matchedOption("no-issues").getValue<Boolean>()).isEqualTo(!findIssues)
            assertThat(parseResult.matchedOption("default-excludes")).isNull()
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedOption("verbose")).isNull()
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = "inv"

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.formatCallback() } returns {
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
            every { ParserDialog.Companion.issueCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.defaultCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.excludeCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.verboseCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val cmdLine = CommandLine(SourceCodeParserMain())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
        }
    }
}
