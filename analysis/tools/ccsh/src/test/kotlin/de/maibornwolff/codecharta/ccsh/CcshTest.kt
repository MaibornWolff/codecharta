package de.maibornwolff.codecharta.ccsh

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveParserSuggestionDialog
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CcshTest {
    private val outContent = ByteArrayOutputStream()
    private val originalOut = System.out
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    private val cmdLine = CommandLine(Ccsh())

    @BeforeAll
    fun setUpStreams() {
        System.setOut(PrintStream(outContent))
    }

    @AfterAll
    fun restoreStreams() {
        System.setOut(originalOut)
    }

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should convert arguments to kebab-case`() {
        val outStream = ByteArrayOutputStream()
        val originalErr = System.err
        System.setErr(PrintStream(outStream))
        val exitCode = Ccsh.executeCommandLine(arrayOf("edgefilter", ".", "--defaultExcludesS=AbC"))

        Assertions.assertThat(exitCode).isNotZero
        Assertions.assertThat(outStream.toString()).contains("--default-excludes-s=AbC")
        System.setErr(originalErr)
    }

    @Test
    fun `should just show help message`() {
        mockkObject(ParserService)
        val outStream = ByteArrayOutputStream()
        val originalOut = System.out
        System.setOut(PrintStream(outStream))

        // val exitCode = ccshCLI.execute("-h")

        val exitCode = Ccsh.executeCommandLine(arrayOf("-h"))

        Assertions.assertThat(exitCode).isEqualTo(0)
        Assertions.assertThat(outStream.toString())
            .contains("Usage: ccsh [-hiv] [COMMAND]", "Command Line Interface for CodeCharta analysis")
        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }
        System.setOut(originalOut)
    }

    @Test
    fun `should execute parser suggestions and all selected parsers when no options are passed`() {
        val selectedParsers = listOf("parser1", "parser2")
        val args = listOf(listOf("dummyArg1"), listOf("dummyArg2"))

        mockkObject(InteractiveParserSuggestionDialog)
        every {
            InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(any())
        } returns mapOf(selectedParsers[0] to args[0], selectedParsers[1] to args[1])

        mockkObject(ParserService)
        every {
            ParserService.executePreconfiguredParser(any(), any())
        } returns 0

        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns true

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns "dummy/path"

        val exitCode = Ccsh.executeCommandLine(emptyArray())
        Assertions.assertThat(exitCode).isZero

        // 3 because 2 parsers and the merge in the end
        verify(exactly = 3) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should only execute parsers when configuration was successful`() {
        mockkObject(InteractiveParserSuggestionDialog)
        every {
            InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(any())
        } returns emptyMap()

        mockkObject(ParserService)
        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0
        every {
            ParserService.executePreconfiguredParser(any(), any())
        } returns 0

        val exitCode = Ccsh.executeCommandLine(emptyArray())

        Assertions.assertThat(exitCode == 0).isTrue()
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should only execute parsers when user does confirm execution`() {
        val selectedParsers = listOf("parser1", "parser2")
        val args = listOf(listOf("dummyArg1"), listOf("dummyArg2"))

        mockkObject(InteractiveParserSuggestionDialog)
        every {
            InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(any())
        } returns mapOf(selectedParsers[0] to args[0], selectedParsers[1] to args[1])

        mockkObject(ParserService)
        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0
        every {
            ParserService.executePreconfiguredParser(any(), any())
        } returns 0

        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns false

        val exitCode = Ccsh.executeCommandLine(emptyArray())

        Assertions.assertThat(exitCode == 0).isTrue()
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should continue executing parsers even if there is an error while executing one`() {
        mockkObject(ParserService)
        every {
            ParserService.executeSelectedParser(any(), any())
        } returns -1
        every {
            ParserService.executePreconfiguredParser(any(), any())
        } returns -1

        val dummyConfiguredParsers = mapOf("dummyParser1" to listOf("dummyArg1", "dummyArg2"), "dummyParser2" to listOf("dummyArg1", "dummyArg2"))

        Ccsh.executeConfiguredParsers(cmdLine, dummyConfiguredParsers)

        verify(exactly = 2) { ParserService.executePreconfiguredParser(any(), any()) }
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute interactive parser when passed parser is unknown`() {
        mockkObject(ParserService)
        every {
            ParserService.selectParser(any(), any())
        } returns "someparser"
        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0

        val exitCode = Ccsh.executeCommandLine(arrayOf("unknownparser"))
        Assertions.assertThat(exitCode).isZero

        verify { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute interactive parser when -i option is passed`() {
        mockkObject(ParserService)
        every {
            ParserService.selectParser(any(), any())
        } returns "someparser"
        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0

        val exitCode = Ccsh.executeCommandLine(arrayOf("-i"))
        Assertions.assertThat(exitCode).isZero

        verify { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute the selected interactive parser when only called with name and no args`() {
        mockkObject(ParserService)
        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0

        System.setErr(PrintStream(errContent))
        val exitCode = Ccsh.executeCommandLine(arrayOf("sonarimport"))
        System.setErr(originalErr)

        Assertions.assertThat(exitCode).isEqualTo(0)
        Assertions.assertThat(errContent.toString())
                .contains("Executing sonarimport")
    }
}
