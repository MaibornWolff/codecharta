package de.maibornwolff.codecharta.ccsh

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveParserSuggestionDialog
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import io.mockk.verify
import mu.KLogger
import mu.KotlinLogging
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CcshTest {
    private val outContent = ByteArrayOutputStream()
    private val originalOut = System.out
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    private val cmdLine = CommandLine(Ccsh())

    @BeforeEach
    fun setupStreams() {
        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
    }

    @AfterEach
    fun restoreStreams() {
        System.setOut(originalOut)
        System.setErr(originalErr)
    }

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private fun mockSuccessfulParserService() {
        mockkObject(ParserService)
        every {
            ParserService.selectParser(any(), any())
        } returns "someparser"

        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0

        every {
            ParserService.executePreconfiguredParser(any(), any())
        } returns 0
    }

    private fun mockUnsuccessfulParserService() {
        mockkObject(ParserService)

        every {
            ParserService.executeSelectedParser(any(), any())
        } returns -1

        every {
            ParserService.executePreconfiguredParser(any(), any())
        } returns -1
    }

    private fun mockInteractiveParserSuggestionDialog(selectedParsers: List<String>,
                                                      parserArgs: List<List<String>>) {
        if (selectedParsers.size != parserArgs.size) {
            throw IllegalArgumentException("There must be the same amount of args as parsers!")
        }

        val parsersAndArgs = mutableMapOf<String, List<String>>()
        selectedParsers.zip(parserArgs) { currentParserName, currentParserArgs ->
            parsersAndArgs.put(currentParserName, currentParserArgs)
        }

        mockkObject(InteractiveParserSuggestionDialog)
        every {
            InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(any())
        } returns parsersAndArgs
    }

    private fun mockKInquirerConfirm(shouldConfirm: Boolean) {
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns shouldConfirm
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

        mockInteractiveParserSuggestionDialog(selectedParsers, args)
        mockSuccessfulParserService()
        mockKInquirerConfirm(true)

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
        mockInteractiveParserSuggestionDialog(emptyList(), emptyList())
        mockSuccessfulParserService()

        val exitCode = Ccsh.executeCommandLine(emptyArray())

        Assertions.assertThat(exitCode == 0).isTrue()
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should only execute parsers when user does confirm execution`() {
        val selectedParsers = listOf("parser1", "parser2")
        val args = listOf(listOf("dummyArg1"), listOf("dummyArg2"))

        mockInteractiveParserSuggestionDialog(selectedParsers, args)
        mockSuccessfulParserService()
        mockKInquirerConfirm(false)

        val exitCode = Ccsh.executeCommandLine(emptyArray())

        Assertions.assertThat(exitCode == 0).isTrue()
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should continue executing parsers even if there is an error while executing one`() {
        mockUnsuccessfulParserService()

        val dummyConfiguredParsers =
                mapOf("dummyParser1" to listOf("dummyArg1", "dummyArg2"),
                        "dummyParser2" to listOf("dummyArg1", "dummyArg2"))
        Ccsh.executeConfiguredParsers(cmdLine, dummyConfiguredParsers)

        verify(exactly = 2) { ParserService.executePreconfiguredParser(any(), any()) }
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute interactive parser when passed parser is unknown`() {
        mockSuccessfulParserService()

        val exitCode = Ccsh.executeCommandLine(arrayOf("unknownparser"))
        Assertions.assertThat(exitCode).isZero

        verify { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute interactive parser when -i option is passed`() {
        mockSuccessfulParserService()

        val exitCode = Ccsh.executeCommandLine(arrayOf("-i"))
        Assertions.assertThat(exitCode).isZero

        verify { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute the selected interactive parser when only called with name and no args`() {
        mockSuccessfulParserService()

        val exitCode = Ccsh.executeCommandLine(arrayOf("sonarimport"))

        Assertions.assertThat(exitCode).isEqualTo(0)
        Assertions.assertThat(errContent.toString())
                .contains("Executing sonarimport")
    }

    @Test
    fun `should not ask for merging results after using parser suggestions if only one parser was executed`() {
        val selectedParsers = listOf("parser1")
        val args = listOf(listOf("dummyArg1"))

        mockInteractiveParserSuggestionDialog(selectedParsers, args)
        mockSuccessfulParserService()
        mockKInquirerConfirm(true)

        val exitCode = Ccsh.executeCommandLine(emptyArray())

        Assertions.assertThat(exitCode).isZero()
        Assertions.assertThat(errContent.toString())
                .contains("Parser was successfully executed.")
    }

    @Test
    fun `should log the correct absolute path of the output file when asked to merge results`() {
        // when
        val folderPath = "src/test/resources"
        val outputFilePath = "$folderPath/mergedResult.cc.json.gz"
        val absoluteOutputFilePath = File(outputFilePath).absolutePath
        val outputFile = File(outputFilePath)
        outputFile.deleteOnExit()
        val multipleConfiguredParsers = mapOf("dummyParser1" to listOf("dummyArg1", "dummyArg2"), "dummyParser2" to listOf("dummyArg1", "dummyArg2"))

        val loggerMock = mockk<KLogger>()
        val infoMessagesLogged = mutableListOf<String>()
        mockkObject(KotlinLogging)
        every { KotlinLogging.logger(any<(() -> Unit)>()) } returns loggerMock
        every { loggerMock.info(capture(infoMessagesLogged)) } returns Unit

        mockKInquirerConfirm(true)

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns folderPath

        // when
        Ccsh.executeConfiguredParsers(cmdLine, multipleConfiguredParsers)

        // then
        verify { loggerMock.info(any<String>()) }
        Assertions.assertThat(infoMessagesLogged.any { e -> e.endsWith(absoluteOutputFilePath) }).isTrue()
    }
}
