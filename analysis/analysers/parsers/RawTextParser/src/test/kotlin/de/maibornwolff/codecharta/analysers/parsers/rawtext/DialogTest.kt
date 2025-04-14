package de.maibornwolff.codecharta.analysers.parsers.rawtext

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.parsers.rawtext.Dialog.Companion.collectAnalyserArgs
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import picocli.CommandLine
import java.io.File

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DialogTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private val inputFileName = "${testResourceBaseFolder}sampleproject/tabs.included"
    private val outputFileName = "test.cc.json"

    @Test
    fun `should output correct arguments when provided with valid input`() {
        val isCompressed = false
        val verbose = false
        val metrics = "metric1"
        val tabWidth = "5"
        val tabWidthValue = 5
        val maxIndentLvl = 10
        val exclude = "file1"
        val withoutDefaultExcludes = false

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
            val verboseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val metricCallback: suspend RunScope.() -> Unit = {
                terminal.type(metrics)
                terminal.press(Keys.ENTER)
            }
            val tabCallback: suspend RunScope.() -> Unit = {
                terminal.type(tabWidth)
                terminal.press(Keys.ENTER)
            }
            val indentationCallback: suspend RunScope.() -> Unit = {
                terminal.type(maxIndentLvl.toString())
                terminal.press(Keys.ENTER)
            }
            val excludeCallback: suspend RunScope.() -> Unit = {
                terminal.type(exclude)
                terminal.press(Keys.ENTER)
            }
            val extensionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val defaultCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback,
                verboseCallback,
                metricCallback,
                tabCallback,
                indentationCallback,
                excludeCallback,
                extensionCallback,
                defaultCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }
        val commandLine = CommandLine(RawTextParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        assertThat(parseResult.matchedOption("metrics").getValue<List<String>>()).isEqualTo(listOf(metrics))
        assertThat(parseResult.matchedOption("max-indentation-level").getValue<Int>()).isEqualTo(maxIndentLvl)
        assertThat(parseResult.matchedOption("tab-width").getValue<Int>()).isEqualTo(tabWidthValue)
        assertThat(parseResult.matchedOption("file-extensions").getValue<List<String>>()).isEqualTo(listOf<String>())
        assertThat(parseResult.matchedOption("without-default-excludes").getValue<Boolean>()).isEqualTo(withoutDefaultExcludes)
        assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isEqualTo(verbose)
        assertThat(parseResult.matchedOption("exclude").getValue<List<String>>()).isEqualTo(listOf(exclude))
        assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
    }

    @ParameterizedTest
    @MethodSource("provideInvalidTabWidth")
    fun `should set tab-width to 0 when non-integer tab-width provided`(invalidTabWidth: String, tabWidthValue: Int) {
        val verbose = false
        val metrics = "metric1"
        val maxIndentLvl = 10
        val exclude = "file1"
        val withoutDefaultExcludes = false

        mockkObject(Dialog.Companion)

        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            val inputFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val verboseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val metricCallback: suspend RunScope.() -> Unit = {
                terminal.type(metrics)
                terminal.press(Keys.ENTER)
            }
            val tabCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidTabWidth)
                terminal.press(Keys.ENTER)
            }
            val indentationCallback: suspend RunScope.() -> Unit = {
                terminal.type(maxIndentLvl.toString())
                terminal.press(Keys.ENTER)
            }
            val excludeCallback: suspend RunScope.() -> Unit = {
                terminal.type(exclude)
                terminal.press(Keys.ENTER)
            }
            val extensionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val defaultCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                inputFileCallback,
                outFileCallback,
                verboseCallback,
                metricCallback,
                tabCallback,
                indentationCallback,
                excludeCallback,
                extensionCallback,
                defaultCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }
        val commandLine = CommandLine(RawTextParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo("")
        assertThat(parseResult.matchedOption("metrics").getValue<List<String>>()).isEqualTo(listOf(metrics))
        assertThat(parseResult.matchedOption("max-indentation-level").getValue<Int>()).isEqualTo(maxIndentLvl)
        assertThat(parseResult.matchedOption("tab-width").getValue<Int>()).isEqualTo(tabWidthValue)
        assertThat(parseResult.matchedOption("file-extensions").getValue<List<String>>()).isEqualTo(listOf<String>())
        assertThat(parseResult.matchedOption("without-default-excludes").getValue<Boolean>()).isEqualTo(withoutDefaultExcludes)
        assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isEqualTo(verbose)
        assertThat(parseResult.matchedOption("exclude").getValue<List<String>>()).isEqualTo(listOf(exclude))
        assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = ""
        val metrics = "metric1"
        val tabWidth = "5"
        val maxIndentLvl = 10
        val exclude = "file1"

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
                terminal.press(Keys.ENTER)
            }
            val verboseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val metricCallback: suspend RunScope.() -> Unit = {
                terminal.type(metrics)
                terminal.press(Keys.ENTER)
            }
            val tabCallback: suspend RunScope.() -> Unit = {
                terminal.type(tabWidth)
                terminal.press(Keys.ENTER)
            }
            val indentationCallback: suspend RunScope.() -> Unit = {
                terminal.type(maxIndentLvl.toString())
                terminal.press(Keys.ENTER)
            }
            val excludeCallback: suspend RunScope.() -> Unit = {
                terminal.type(exclude)
                terminal.press(Keys.ENTER)
            }
            val extensionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val defaultCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback,
                verboseCallback,
                metricCallback,
                tabCallback,
                indentationCallback,
                excludeCallback,
                extensionCallback,
                defaultCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }
        val commandLine = CommandLine(RawTextParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(File(inputFileName).name)
    }

    private fun provideInvalidTabWidth(): List<Arguments> {
        return listOf(
            Arguments.of("12.", 12),
            Arguments.of("12a sa---__d", 12),
            Arguments.of("noInt", 0)
        )
    }
}
