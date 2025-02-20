package de.maibornwolff.codecharta.ccsh.parser

import de.maibornwolff.codecharta.ccsh.SessionMock.Companion.mockRunInTerminalSession
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveParserSuggestion
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InteractiveParserSuggestionTest {
    private val outContent = ByteArrayOutputStream()
    private val originalOut = System.out
    private val errorOut = ByteArrayOutputStream()
    private val originalErrorOut = System.err
    private val cmdLine = CommandLine(Ccsh())

    @BeforeAll
    fun setUpStreams() {
        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errorOut))
    }

    @AfterAll
    fun restoreStreams() {
        System.setOut(originalOut)
        System.setErr(originalErrorOut)
    }

    @BeforeEach
    fun beforeTest() {
        mockRunInTerminalSession()
    }

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private fun mockPrepareInteractiveDialog() {
        mockkObject(InteractiveDialog)
    }

    private fun mockDialogScannerPath(pathToReturn: String) {
        every { InteractiveDialog.askForPath(any()) } returns pathToReturn
    }

    private fun mockDialogApplicableParserSelection(parserSelection: List<String>) {
        every { InteractiveDialog.askApplicableParser(any(), any()) } returns parserSelection
    }

    @Test
    fun `should only output message when no usable parsers were found`() {
        mockPrepareInteractiveDialog()
        mockDialogScannerPath("src")
        mockkObject(ParserService)
        every {
            ParserService.getParserSuggestions(any(), any(), any())
        } returns emptyList()

        val usableParsers =
            InteractiveParserSuggestion.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(errorOut.toString()).contains(Ccsh.NO_USABLE_PARSER_FOUND_MESSAGE)
        Assertions.assertThat(usableParsers).isNotNull
        Assertions.assertThat(usableParsers).isEmpty()
    }

    @Test
    fun `should return empty map when user does not select any parser`() {
        mockPrepareInteractiveDialog()
        mockDialogScannerPath("src/test/resources/sampleproject/foo.java")
        mockDialogApplicableParserSelection(emptyList())

        val parser = "dummyParser"

        mockkObject(ParserService)
        every {
            ParserService.getParserSuggestions(any(), any(), any())
        } returns listOf(parser)

        val selectedParsers =
            InteractiveParserSuggestion.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(selectedParsers).isNotNull
        Assertions.assertThat(selectedParsers).isEmpty()
    }

    @Test
    fun `should return configured parsers after user finished configuring selection`() {
        val parserWithDescription = "dummyParser - dummyDescription"
        val parserWithoutDescription = "dummyParser"
        val configuration = listOf("dummyArg")
        val parserListWithDescription = listOf(parserWithDescription)
        val parserListWithoutDescription = listOf(parserWithoutDescription)

        mockPrepareInteractiveDialog()
        mockDialogApplicableParserSelection(parserListWithDescription)
        mockDialogScannerPath("src")

        mockkObject(ParserService)
        every {
            ParserService.getParserSuggestions(any(), any(), any())
        } returns parserListWithDescription

        every {
            ParserService.configureParserSelection(any(), any(), any())
        } returns mapOf(parserWithoutDescription to configuration)

        val configuredParsers =
            InteractiveParserSuggestion.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        verify { ParserService.configureParserSelection(any(), any(), parserListWithoutDescription) }

        Assertions.assertThat(configuredParsers).isNotNull
        Assertions.assertThat(configuredParsers).isNotEmpty

        Assertions.assertThat(configuredParsers).containsKey(parserWithoutDescription)
        Assertions.assertThat(configuredParsers[parserWithoutDescription] == configuration).isTrue()
    }

    @Test
    fun `should return empty map when user enters empty input to scan`() {
        mockPrepareInteractiveDialog()
        mockDialogScannerPath("")

        val selectedParsers =
            InteractiveParserSuggestion.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(selectedParsers).isNotNull
        Assertions.assertThat(selectedParsers).isEmpty()
        Assertions.assertThat(errorOut.toString()).contains("Specified invalid or empty path to analyze! Aborting...")
    }

    @Test
    fun `should return empty map when user enters nonexistent input to scan`() {
        mockPrepareInteractiveDialog()
        mockDialogScannerPath("src/test/resources/does/not/exist")

        val selectedParsers =
            InteractiveParserSuggestion.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(selectedParsers).isNotNull
        Assertions.assertThat(selectedParsers).isEmpty()
        Assertions.assertThat(errorOut.toString()).contains("Specified invalid or empty path to analyze! Aborting...")
    }
}
