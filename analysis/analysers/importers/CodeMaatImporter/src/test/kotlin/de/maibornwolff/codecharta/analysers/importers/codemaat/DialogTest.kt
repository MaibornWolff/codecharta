package de.maibornwolff.codecharta.analysers.importers.codemaat

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.importers.codemaat.Dialog.Companion.collectAnalyserArgs
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
    private val inputFileName = "${testResourceBaseFolder}coupling-codemaat.csv"

    @Test
    fun `should output correct arguments when valid input is provided`() {
        mockkObject(Dialog.Companion)

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback
            )

            val parserArguments = collectAnalyserArgs(this)
            val cmdLine = CommandLine(CodeMaatImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>())
                .isEqualTo("")
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name)
                .isEqualTo(File(inputFileName).name)
        }
    }

    @Test
    fun `should output correct arguments when multiple valid inputs are provided`() {
        mockkObject(Dialog.Companion)
        val inputFileName2 = "${testResourceBaseFolder}testFile.csv"

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.type(" , ")
                terminal.type(inputFileName2)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback
            )

            val parserArguments = collectAnalyserArgs(this)
            val cmdLine = CommandLine(CodeMaatImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>())
                .isEqualTo("")
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name)
                .isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[1].name)
                .isEqualTo(File(inputFileName2).name)
        }
    }

    @Test
    fun `should output correct arguments when compress flag is set`() {
        val outputFileName = "cmi.cc.json"
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
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)
            val cmdLine = CommandLine(CodeMaatImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(File(inputFileName).name)
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = ""
        val outputFileName = "cmi.cc.json"

        mockkObject(Dialog.Companion)

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)
            val cmdLine = CommandLine(CodeMaatImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<List<File>>()[0].name).isEqualTo(File(inputFileName).name)
        }
    }
}
