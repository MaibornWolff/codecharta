package de.maibornwolff.codecharta.importer.metricgardenerimporter

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.importer.metricgardenerimporter.ParserDialog.Companion.collectParserArgs
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
    private val inputFileName = "${testResourceBaseFolder}metricgardener-analysis.json"
    private val outputFileName = "out.cc.json"
    private val inputFolderName = "${testResourceBaseFolder}my"

    @Test
    fun `should output correct arguments when compress-flag is not set`() {
        val isCompressed = false
        val isJsonFile = true

        mockkObject(ParserDialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->

            val jsonCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                jsonCallback,
                fileCallback,
                outFileCallback,
                compressCallback
            )

            parserArguments = collectParserArgs(this)
        }

        val cmdLine = CommandLine(MetricGardenerImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().name)
            .isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedOption("output-file").getValue<String>())
            .isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>())
            .isEqualTo(isCompressed)
        assertThat(parseResult.matchedOption("is-json-file").getValue<Boolean>())
            .isEqualTo(isJsonFile)
    }

    @Test
    fun `should output correct arguments when compress-flag is set`() {
        val isCompressed = false

        mockkObject(ParserDialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            val jsonCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                jsonCallback,
                fileCallback,
                outFileCallback,
                compressCallback
            )

            parserArguments = collectParserArgs(this)
        }

        val cmdLine = CommandLine(MetricGardenerImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().name)
            .isEqualTo(File(inputFolderName).name)
        assertThat(parseResult.matchedOption("output-file").getValue<String>())
            .isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>())
            .isEqualTo(isCompressed)
        assertThat(parseResult.matchedOption("is-json-file")).isNull()
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = "inv"

        mockkObject(ParserDialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            val jsonCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(inputFolderName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { ParserDialog.Companion.testCallback() } returnsMany listOf(
                jsonCallback,
                fileCallback,
                outFileCallback,
                compressCallback
            )

            parserArguments = collectParserArgs(this)
        }

        val cmdLine = CommandLine(MetricGardenerImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().name)
            .isEqualTo(File(inputFolderName).name)
        assertThat(parseResult.matchedOption("not-compressed")).isNull()
        assertThat(parseResult.matchedOption("is-json-file")).isNull()
    }
}
