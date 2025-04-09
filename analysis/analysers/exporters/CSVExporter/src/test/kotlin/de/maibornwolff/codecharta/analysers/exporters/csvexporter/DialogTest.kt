package de.maibornwolff.codecharta.analysers.exporters.csvexporter

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.exporters.csv.CSVExporter
import de.maibornwolff.codecharta.analysers.exporters.csv.Dialog
import de.maibornwolff.codecharta.analysers.exporters.csv.Dialog.Companion.collectAnalyserArgs
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
class DialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFileName = "${testResourceBaseFolder}input_valid_1.cc.json"
    private val outputFileName = "out.csv"

    @Test
    fun `should output correct arguments when provided with valid input`() {
        val hierarchy = 5

        mockkObject(Dialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val hierarchyCallback: suspend RunScope.() -> Unit = {
                terminal.type(hierarchy.toString())
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                hierarchyCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(CSVExporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<Array<File>>().first().name)
            .isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedOption("output-file").getValue<String>())
            .isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("depth-of-hierarchy").getValue<Int>())
            .isEqualTo(hierarchy)
    }

    @Test
    fun `should accept multiple input files separated by comma`() {
        val hierarchy = 5
        val inputFileName2 = "${testResourceBaseFolder}input_valid_2.cc.json"

        mockkObject(Dialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.type(", ")
                terminal.type(inputFileName2)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val hierarchyCallback: suspend RunScope.() -> Unit = {
                terminal.type(hierarchy.toString())
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                hierarchyCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(CSVExporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<Array<File>>().first().name)
            .isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedPositional(0).getValue<Array<File>>()[1].name)
            .isEqualTo(File(inputFileName2).name)
        assertThat(parseResult.matchedOption("output-file").getValue<String>())
            .isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("depth-of-hierarchy").getValue<Int>())
            .isEqualTo(hierarchy)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = "inv.txt"

        mockkObject(Dialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                repeat(invalidFileName.length) {
                    terminal.press(Keys.BACKSPACE)
                }
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val hierarchyCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                hierarchyCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(CSVExporter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<Array<File>>().first().name)
            .isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedOption("output-file").getValue<String>())
            .isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("depth-of-hierarchy").getValue<Int>())
            .isEqualTo(10)
    }
}
