@file:Suppress("ktlint:standard:max-line-length")

package de.maibornwolff.codecharta.analysers.importers.csv

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.importers.csv.Dialog.Companion.collectAnalyserArgs
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File

@Timeout(120)
class DialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFileName = "${testResourceBaseFolder}csvimporter.csv"
    private val outputFileName = "out.cc.json"
    private val pathColumnName = "path"
    private val pathSeparator = "/"

    @Test
    fun `should output correct arguments when valid input is provided`() {
        val delimiter = ";"
        val isCompressed = false

        mockkObject(Dialog.Companion)

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val columnCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathColumnName)
                terminal.press(Keys.ENTER)
            }
            val delimiterCallback: suspend RunScope.() -> Unit = {
                terminal.type(delimiter)
                terminal.press(Keys.ENTER)
            }
            val separatorCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathSeparator)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                columnCallback,
                delimiterCallback,
                separatorCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)

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

    @Test
    fun `should output correct arguments when multiple files are provided`() {
        val inputFileName2 = "${testResourceBaseFolder}csvimporter_different_path_column_name.csv"
        val outputFileName = "out.cc.json"
        val pathColumnName = "path"
        val pathSeparator = "/"

        mockkObject(Dialog.Companion)

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.type(",")
                terminal.type(inputFileName2)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val columnCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathColumnName)
                terminal.press(Keys.ENTER)
            }
            val delimiterCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val separatorCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathSeparator)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                columnCallback,
                delimiterCallback,
                separatorCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)

            val cmdLine = CommandLine(CSVImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("path-column-name").getValue<String>())
                .isEqualTo(pathColumnName)
            assertThat(parseResult.matchedOption("delimiter").getValue<Char>()).isEqualTo(',')
            assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(pathSeparator[0])
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[1].name).isEqualTo(File(inputFileName2).name)
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName1 = "inv"
        val delimiter = ","
        val separator = "\\"

        mockkObject(Dialog.Companion)

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidFileName1)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val columnCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathColumnName)
                terminal.press(Keys.ENTER)
            }
            val delimiterCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val separatorCallback: suspend RunScope.() -> Unit = {
                terminal.type(separator)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                columnCallback,
                delimiterCallback,
                separatorCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)

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
