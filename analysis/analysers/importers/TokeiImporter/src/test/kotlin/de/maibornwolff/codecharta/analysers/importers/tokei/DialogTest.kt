package de.maibornwolff.codecharta.analysers.importers.tokei

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.importers.tokei.Dialog.Companion.collectAnalyserArgs
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
    private val inputFileName = "${testResourceBaseFolder}tokei_12_minimal.json"
    private val outputFileName = "out_test.cc.json"
    private val rootFolder = "/foo/bar"

    @Test
    fun `should output correct arguments when valid input is provided`() {
        val pathSeparator = "/"
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

            val rootCallback: suspend RunScope.() -> Unit = {
                terminal.type(rootFolder)
                terminal.press(Keys.ENTER)
            }

            val pathCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathSeparator)
                terminal.press(Keys.ENTER)
            }

            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                rootCallback,
                pathCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)
            val cmdLine = CommandLine(TokeiImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("output-file").getValue<String>().equals(outputFileName))
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
            assertThat(parseResult.matchedOption("root-name").getValue<String>()).isEqualTo(rootFolder)
            assertThat(parseResult.matchedOption("path-separator").getValue<String>()).isEqualTo(pathSeparator)
        }
    }

    @Test
    fun `should output correct arguments when output file is not provided`() {
        val pathSeparator = "/"

        mockkObject(Dialog.Companion)

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }

            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER) // User skips providing output file
            }

            val rootCallback: suspend RunScope.() -> Unit = {
                terminal.type(rootFolder)
                terminal.press(Keys.ENTER)
            }

            val pathCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathSeparator)
                terminal.press(Keys.ENTER)
            }

            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                rootCallback,
                pathCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)
            val cmdLine = CommandLine(TokeiImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo("")
            assertThat(parseResult.matchedOption("not-compressed")).isNull()
            assertThat(parseResult.matchedOption("root-name").getValue<String>()).isEqualTo(rootFolder)
            assertThat(parseResult.matchedOption("path-separator").getValue<String>()).isEqualTo(pathSeparator)
        }
    }

    @Test
    fun `should escape a single backslash`() {
        val pathSeparator = "\\"
        val pathSeparatorEscaped = "\\\\"
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

            val rootCallback: suspend RunScope.() -> Unit = {
                terminal.type(rootFolder)
                terminal.press(Keys.ENTER)
            }

            val pathCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathSeparator)
                terminal.press(Keys.ENTER)
            }

            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                rootCallback,
                pathCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)
            val cmdLine = CommandLine(TokeiImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name)
                .isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("output-file").getValue<String>())
                .isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>())
                .isEqualTo(isCompressed)
            assertThat(parseResult.matchedOption("root-name").getValue<String>())
                .isEqualTo(rootFolder)
            assertThat(parseResult.matchedOption("path-separator").getValue<String>())
                .isEqualTo(pathSeparatorEscaped)
        }
    }

    @Test
    fun `should not escape a double backslash`() {
        val pathSeparator = "\\\\"
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

            val rootCallback: suspend RunScope.() -> Unit = {
                terminal.type(rootFolder)
                terminal.press(Keys.ENTER)
            }

            val pathCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathSeparator)
                terminal.press(Keys.ENTER)
            }

            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                rootCallback,
                pathCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)
            val cmdLine = CommandLine(TokeiImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name)
                .isEqualTo(File(inputFileName).name)
            assertThat(parseResult.matchedOption("output-file").getValue<String>())
                .isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>())
                .isEqualTo(isCompressed)
            assertThat(parseResult.matchedOption("root-name").getValue<String>())
                .isEqualTo(rootFolder)
            assertThat(parseResult.matchedOption("path-separator").getValue<String>())
                .isEqualTo(pathSeparator)
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = "inv"
        val pathSeparator = "/"

        mockkObject(Dialog.Companion)

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

            val rootCallback: suspend RunScope.() -> Unit = {
                terminal.type(rootFolder)
                terminal.press(Keys.ENTER)
            }

            val pathCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathSeparator)
                terminal.press(Keys.ENTER)
            }

            val compressCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                rootCallback,
                pathCallback,
                compressCallback
            )

            val parserArguments = collectAnalyserArgs(this)

            val cmdLine = CommandLine(TokeiImporter())
            val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

            assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
        }
    }
}
