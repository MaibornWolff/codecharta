@file:Suppress("ktlint:standard:max-line-length")

package de.maibornwolff.codecharta.importer.csv

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.importer.csv.ParserDialog.Companion.collectParserArgs
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFileName = "${testResourceBaseFolder}csvimporter.csv"
    private val outputFileName = "out.cc.json"
    private val pathColumnName = "path"
    private val pathSeparator = "/"

    @Test
    fun `should output correct arguments when valid input is provided`() {
        val delimiter = ";"
        val isCompressed = false

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
            every { ParserDialog.Companion.columnCallback() } returns {
                terminal.type(pathColumnName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.delimiterCallback() } returns {
                terminal.type(delimiter)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.separatorCallback() } returns {
                terminal.type(pathSeparator)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val cmdLine = CommandLine(CSVImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("path-column-name").getValue<String>())
                .isEqualTo(pathColumnName)
            assertThat(parseResult.matchedOption("delimiter").getValue<Char>()).isEqualTo(delimiter[0])
            assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(pathSeparator[0])
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(File(inputFileName).name)
        }
    }

    @Disabled
    @Test
    fun `should output correct arguments when multiple files are provided`() { // given
        // New multi input separated by comma, NotImplementedYet
        val fileName = "in.csv"
        val fileName2 = "in2.csv"
        val fileName3 = "in3.csv"
        val outputFileName = "out.cc.json"
        val pathColumnName = "path"
        val delimiter = ";"
        val pathSeparator = "/"

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.columnCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.delimiterCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.separatorCallback() } returns {
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val cmdLine = CommandLine(CSVImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("path-column-name").getValue<String>())
                .isEqualTo(pathColumnName)
            assertThat(parseResult.matchedOption("delimiter").getValue<Char>()).isEqualTo(delimiter[0])
            assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(pathSeparator[0])
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(fileName)
            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[1].name).isEqualTo(fileName2)
            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[2].name).isEqualTo(fileName3)
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName1 = "inv"
        val delimiter = ","
        val separator = "\\"

        mockkObject(ParserDialog.Companion)

        testSession { terminal ->
            every { ParserDialog.Companion.fileCallback() } returns {
                terminal.type(invalidFileName1)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.columnCallback() } returns {
                terminal.type(pathColumnName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.delimiterCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.separatorCallback() } returns {
                terminal.type(separator)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.compressCallback() } returns {
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val cmdLine = CommandLine(CSVImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name)
                .isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("delimiter").getValue<Char>()).isEqualTo(delimiter[0])
            assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(separator[0])
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
        }
    }
}
