package de.maibornwolff.codecharta.analysers.importers.sourcemonitor

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.importers.sourcemonitor.Dialog.Companion.collectAnalyserArgs
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
    private val inputFileName = "${testResourceBaseFolder}sourcemonitor.csv"
    private val outputFileName = "out.cc.json"

    @Test
    fun `should output correct arguments when valid input is provided`() {
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
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val cmdLine = CommandLine(SourceMonitorImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed")).isNull()
        assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(File(inputFileName).name)
    }

    @Test
    fun `should output correct arguments when multiple valid inputs are provided`() {
        val inputFileName2 = "${testResourceBaseFolder}testFile.csv"

        mockkObject(Dialog.Companion)

        var parserArguments: List<String> = emptyList()

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
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val cmdLine = CommandLine(SourceMonitorImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed")).isNull()
        assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name).isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[1].name).isEqualTo(File(inputFileName2).name)
    }

    @Test
    fun `should output correct arguments not compressed`() {
        val isCompressed = false

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
            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val cmdLine = CommandLine(SourceMonitorImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>())
            .isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>())
            .isEqualTo(isCompressed)
        assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name)
            .isEqualTo(File(inputFileName).name)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = "inv"

        mockkObject(Dialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
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

            parserArguments = collectAnalyserArgs(this)
        }

        val cmdLine = CommandLine(SourceMonitorImporter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<ArrayList<File>>()[0].name)
            .isEqualTo(File(inputFileName).name)
    }
}
