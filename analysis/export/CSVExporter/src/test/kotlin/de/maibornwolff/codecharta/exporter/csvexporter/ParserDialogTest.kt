package de.maibornwolff.codecharta.exporter.csvexporter

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.exporter.csv.ParserDialog
import de.maibornwolff.codecharta.exporter.csv.ParserDialog.Companion.collectParserArgs
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
    private val inputFileName = "${testResourceBaseFolder}input_valid_1.cc.json"
    private val outputFileName = "out.csv"

    @Test
    fun `should output correct arguments when provided with valid input`() {
        val hierarchy = 5

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
            every { ParserDialog.Companion.hierarchyCallback() } returns {
                terminal.type(hierarchy.toString())
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val commandLine = CommandLine(CSVExporter())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<Array<File>>().first().name)
                .isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("depth-of-hierarchy").getValue<Int>()).isEqualTo(hierarchy)
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
            every { ParserDialog.Companion.outFileCallback() } returns {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            every { ParserDialog.Companion.hierarchyCallback() } returns {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            val parserArguments = collectParserArgs(this)

            val commandLine = CommandLine(CSVExporter())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<Array<File>>().first().name)
                .isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("depth-of-hierarchy").getValue<Int>()).isEqualTo(10)
        }
    }
}
