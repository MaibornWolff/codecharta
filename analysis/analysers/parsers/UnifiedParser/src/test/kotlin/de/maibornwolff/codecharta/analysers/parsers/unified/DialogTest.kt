package de.maibornwolff.codecharta.analysers.parsers.unified

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.parsers.unified.Dialog.Companion.collectAnalyserArgs
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
    private val inputFileName = "src/test/resources/sampleproject"
    private val outputFileName = "test.cc.json"

    @Test
    fun `should output correct arguments when provided with valid input`() {
        val isCompressed = false
        val isVerbose = false
        val exclude = "testExtension"
        val include = "onlyThis"

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
            val useGitignoreCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val excludeOrIncludeCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val excludeCallback: suspend RunScope.() -> Unit = {
                terminal.type(exclude)
                terminal.press(Keys.ENTER)
            }
            val limitFileExtensionsCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val includeCallback: suspend RunScope.() -> Unit = {
                terminal.type(include)
                terminal.press(Keys.ENTER)
            }
            val verboseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback,
                useGitignoreCallback,
                excludeOrIncludeCallback,
                excludeCallback,
                limitFileExtensionsCallback,
                includeCallback,
                verboseCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }
        val commandLine = CommandLine(UnifiedParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<List<File>>().first().name).isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isEqualTo(isVerbose)
        assertThat(parseResult.matchedOption("exclude").getValue<List<String>>()).isEqualTo(listOf(exclude))
        assertThat(parseResult.matchedOption("file-extensions").getValue<List<String>>()).isEqualTo(listOf(include))
        assertThat(parseResult.hasMatchedOption("include-build-folders")).isFalse()
    }

    @Test
    fun `should skip questions about exclude and include when it was selected that none should be set`() {
        val isCompressed = false
        val isVerbose = false

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
            val useGitignoreCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val includeBuildCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val excludeOrIncludeCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val limitFileExtensionsCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }
            val verboseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback,
                useGitignoreCallback,
                includeBuildCallback,
                excludeOrIncludeCallback,
                limitFileExtensionsCallback,
                verboseCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }
        val commandLine = CommandLine(UnifiedParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<List<File>>().first().name).isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isEqualTo(isVerbose)
        assertThat(parseResult.matchedOption("exclude").getValue<List<String>>()).isEqualTo(listOf<String>())
        assertThat(parseResult.matchedOption("file-extensions").getValue<List<String>>()).isEqualTo(listOf<String>())
        assertThat(parseResult.hasMatchedOption("include-build-folders")).isTrue()
    }

    @Test
    fun `should not include flag for not compressed when output should be compressed`() {
        val isVerbose = false
        val exclude = "testExtension"
        val include = "onlyThis"

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
            val useGitignoreCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val excludeOrIncludeCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val excludeCallback: suspend RunScope.() -> Unit = {
                terminal.type(exclude)
                terminal.press(Keys.ENTER)
            }
            val limitFileExtensionsCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val includeCallback: suspend RunScope.() -> Unit = {
                terminal.type(include)
                terminal.press(Keys.ENTER)
            }
            val verboseCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }

            every { Dialog.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                compressCallback,
                useGitignoreCallback,
                excludeOrIncludeCallback,
                excludeCallback,
                limitFileExtensionsCallback,
                includeCallback,
                verboseCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }
        val commandLine = CommandLine(UnifiedParser())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<List<File>>().first().name).isEqualTo(File(inputFileName).name)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.hasMatchedOption("not-compressed")).isFalse()
        assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isEqualTo(isVerbose)
        assertThat(parseResult.matchedOption("exclude").getValue<List<String>>()).isEqualTo(listOf(exclude))
        assertThat(parseResult.matchedOption("file-extensions").getValue<List<String>>()).isEqualTo(listOf(include))
        assertThat(parseResult.hasMatchedOption("include-build-folders")).isFalse()
    }
}
