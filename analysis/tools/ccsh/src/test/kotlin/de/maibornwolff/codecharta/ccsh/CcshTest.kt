package de.maibornwolff.codecharta.ccsh

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
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
import java.io.PrintWriter
import java.io.StringWriter

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CcshTest {

    private val outContent = ByteArrayOutputStream()
    private val originalOut = System.out
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
        val originalOut = System.out
        System.setErr(PrintStream(outStream))
        val exitCode = Ccsh.executeCommandLine(arrayOf("edgefilter", ".", "--defaultExcludesS=AbC"))

        Assertions.assertThat(exitCode).isNotZero
        Assertions.assertThat(outStream.toString()).contains("--default-excludes-s=AbC")
        System.setOut(originalOut)
    }

    @Test
    fun `should just show help message`() {
        mockkObject(ParserService)
        val ccshCLI = CommandLine(Ccsh())
        val contentOutput = StringWriter()
        ccshCLI.out = PrintWriter(contentOutput)

        val exitCode = ccshCLI.execute("-h")

        Assertions.assertThat(exitCode).isEqualTo(0)
        Assertions.assertThat(contentOutput.toString())
            .contains("Usage: ccsh [-hiv] [COMMAND]", "Command Line Interface for CodeCharta analysis")
        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should execute parser suggestions and all selected parsers when no options are passed`() {
        val parser1 = "parser1"
        val parser2 = "parser2"

        mockkObject(ParserService)
        every {
            ParserService.offerParserSuggestions(any(), any(), any())
        } returns listOf(parser1, parser2)

        every {
            ParserService.configureParserSelection(any(), any(), any())
        } returns mapOf(parser1 to listOf("dummyArg"), parser2 to listOf("dummyArg"))

        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0

        every {
            ParserService.executePreconfiguredParser(any(), any())
        } returns 0

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns ""
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns true

        val exitCode = Ccsh.executeCommandLine(emptyArray())
        Assertions.assertThat(exitCode).isZero

        verify(exactly = 2) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should only output message when no usable parsers were found`() {
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns ""

        mockkObject(ParserService)
        every {
            ParserService.offerParserSuggestions(any(), any(), any())
        } returns emptyList()

        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0
        every {
            ParserService.executePreconfiguredParser(any(), any())
        } returns 0

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns ""

        val exitCode = Ccsh.executeCommandLine(emptyArray())

        Assertions.assertThat(exitCode).isEqualTo(0)
        Assertions.assertThat(outContent.toString())
                .contains(Ccsh.NO_USABLE_PARSER_FOUND_MESSAGE)

        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should only configure suggested interactive parsers and not execute them`() {
        val parser1 = "parser1"
        val parser2 = "parser2"

        mockkObject(ParserService)
        every {
            ParserService.offerParserSuggestions(any(), any(), any())
        } returns listOf(parser1, parser2)

        every {
            ParserService.configureParserSelection(any(), any(), any())
        } returns mapOf(parser1 to listOf("dummyArg"), parser2 to listOf("dummyArg"))

        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0
        every {
            ParserService.executePreconfiguredParser(any(), any())
        } returns 0

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns ""
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns true

        val ccshCLI = CommandLine(Ccsh())

        Ccsh.offerInteractiveParserSuggestions(ccshCLI)

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
}
