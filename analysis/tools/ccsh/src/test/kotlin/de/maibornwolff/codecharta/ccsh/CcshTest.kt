package de.maibornwolff.codecharta.ccsh

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
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

    private fun mockInteractiveParserSuggestionDialog(
    selectedParsers: List<String>,
                                                      parserArgs: List<List<String>>
    ) {
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
    fun `should convert all arguments to snake-case when given arguments`() {
        // given
        val outStream = ByteArrayOutputStream()
        val originalErr = System.err
        System.setErr(PrintStream(outStream))

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("edgefilter", ".", "--defaultExcludesS=AbC"))

        // then
        Assertions.assertThat(exitCode).isNotZero()
        Assertions.assertThat(outStream.toString()).contains("--default-excludes-s=AbC")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should only show help message when executed with help flag`() {
        // given
        mockkObject(ParserService)
        val outStream = ByteArrayOutputStream()
        val originalOut = System.out
        System.setOut(PrintStream(outStream))

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("-h"))

        // then
        Assertions.assertThat(exitCode).isEqualTo(0)
        Assertions.assertThat(outStream.toString())
            .contains("Usage: ccsh [-hiv] [COMMAND]", "Command Line Interface for CodeCharta analysis")
        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }

        // clean up
        System.setOut(originalOut)
    }

    @Test
    fun `should execute parser suggestions and all selected parsers when no options are passed`() {
        // given
        val selectedParsers = listOf("parser1", "parser2")
        val args = listOf(listOf("dummyArg1"), listOf("dummyArg2"))

        mockInteractiveParserSuggestionDialog(selectedParsers, args)
        mockSuccessfulParserService()
        mockKInquirerConfirm(true)

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns "dummy/path"

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        Assertions.assertThat(exitCode).isZero
        // 3 because 2 parsers and the merge in the end
        verify(exactly = 3) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should only execute parsers when configuration was successful`() {
        // given
        mockInteractiveParserSuggestionDialog(emptyList(), emptyList())
        mockSuccessfulParserService()

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        Assertions.assertThat(exitCode == 0).isTrue()
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should only execute parsers when user does confirm execution`() {
        // given
        val selectedParsers = listOf("parser1", "parser2")
        val args = listOf(listOf("dummyArg1"), listOf("dummyArg2"))

        mockInteractiveParserSuggestionDialog(selectedParsers, args)
        mockSuccessfulParserService()
        mockKInquirerConfirm(false)

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        Assertions.assertThat(exitCode == 0).isTrue()
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
        verify(exactly = 0) { ParserService.executePreconfiguredParser(any(), any()) }
    }

    @Test
    fun `should continue executing parsers even when one parser throws an error`() {
        // given
        mockUnsuccessfulParserService()
        val dummyConfiguredParsers =
                mapOf(
                "dummyParser1" to listOf("dummyArg1", "dummyArg2"),
                        "dummyParser2" to listOf("dummyArg1", "dummyArg2")
                )

        // when
        Ccsh.executeConfiguredParsers(cmdLine, dummyConfiguredParsers)

        // then
        verify(exactly = 2) { ParserService.executePreconfiguredParser(any(), any()) }
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute interactive parser when passed parser is unknown`() {
        // given
        mockSuccessfulParserService()

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("unknownparser"))

        // then
        Assertions.assertThat(exitCode).isZero
        verify { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute interactive parser when -i option is passed`() {
        // given
        mockSuccessfulParserService()

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("-i"))

        // then
        Assertions.assertThat(exitCode).isZero
        verify { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute the selected interactive parser when only called with name and no args`() {
        // given
        mockSuccessfulParserService()

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("sonarimport"))

        // then
        Assertions.assertThat(exitCode).isEqualTo(0)
        Assertions.assertThat(errContent.toString())
                .contains("Executing sonarimport")
    }

    @Test
    fun `should not ask for merging results after using parser suggestions when only one parser was executed`() {
        // given
        val selectedParsers = listOf("parser1")
        val args = listOf(listOf("dummyArg1"))

        mockInteractiveParserSuggestionDialog(selectedParsers, args)
        mockSuccessfulParserService()
        mockKInquirerConfirm(true)

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        Assertions.assertThat(exitCode).isZero()
        Assertions.assertThat(errContent.toString())
                .contains("Parser was successfully executed.")
    }

    @Test
    fun `should log the absolute path of the merged output file when asked to merge results`() {
        // given
        val folderPath = "src/test/resources/mergefiles"
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
        Assertions.assertThat(infoMessagesLogged.any { e -> e.endsWith(absoluteOutputFilePath) }).isTrue()
        verify { loggerMock.info(any<String>()) }
    }

    @Test
    fun `should log the absolute path of the merged output file when one out of two parsers prints output to stdout`() {
        val folderPath = "src/test/resources/sampleproject"
        val mergedOutputFilePath = "$folderPath/mergedResult.cc.json.gz"
        val mergedOutputFile = File(mergedOutputFilePath)
        val sourcecodeOutputFilePath = "$folderPath/source.cc.json"
        val sourcecodeOutputFile = File(sourcecodeOutputFilePath)
        mergedOutputFile.deleteOnExit()
        sourcecodeOutputFile.deleteOnExit()

        val selectedParsers = listOf("rawtextparser", "sourcecodeparser")
        val args = listOf(
                listOf(File(folderPath).absolutePath, "--output-file="),
                listOf(File(folderPath).absolutePath, "--format=JSON", "--output-file=$sourcecodeOutputFilePath", "--no-issues", "--default-excludes", "--not-compressed")
        )

        mockInteractiveParserSuggestionDialog(selectedParsers, args)
        mockKInquirerConfirm(true)
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns File(folderPath).absolutePath

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        Assertions.assertThat(exitCode).isZero()
        Assertions.assertThat(mergedOutputFile).exists()
    }
}
