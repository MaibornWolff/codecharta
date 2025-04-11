package de.maibornwolff.codecharta.analysers.filters.edgefilter

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.filters.edgefilter.Dialog.Companion.collectAnalyserArgs
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
    private val inputFileName = "${testResourceBaseFolder}coupling.cc.json"
    private val outputFileName = "sampleOutputFile"
    private val separator = '/'

    @Test
    fun `should output correct arguments when provided with valid input`() {
        mockkObject(Dialog.Companion)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->
            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(inputFileName)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }
            val separatorCallback: suspend RunScope.() -> Unit = {
                terminal.type(separator)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                separatorCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val cmdLine = CommandLine(EdgeFilter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(separator)
        assertThat(parseResult.matchedPositional(0).getValue<File>()).isEqualTo(File(inputFileName))
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidFileName = ""

        mockkObject(Dialog.Companion)

        var parserArguments: List<String> = listOf()

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
            val separatorCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.RIGHT)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                outFileCallback,
                separatorCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val cmdLine = CommandLine(EdgeFilter())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("path-separator").getValue<Char>()).isEqualTo(separator)
        assertThat(parseResult.matchedPositional(0).getValue<File>()).isEqualTo(File(inputFileName))
    }
}
