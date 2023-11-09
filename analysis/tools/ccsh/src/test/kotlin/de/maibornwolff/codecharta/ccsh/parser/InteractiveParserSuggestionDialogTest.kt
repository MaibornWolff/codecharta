package de.maibornwolff.codecharta.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptCheckbox
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveParserSuggestionDialog
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import io.mockk.*
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InteractiveParserSuggestionDialogTest {
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

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should only output message when no usable parsers were found`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns "src"

        mockkObject(ParserService)
        every {
            ParserService.getParserSuggestions(any(), any(), any())
        } returns emptyList()

        val usableParsers = InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(errorOut.toString()).contains(Ccsh.NO_USABLE_PARSER_FOUND_MESSAGE)
        Assertions.assertThat(usableParsers).isNotNull
        Assertions.assertThat(usableParsers).isEmpty()
    }

    @Test
    fun `should return empty map when user does not select any parser`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns "src"

        mockkStatic("com.github.kinquirer.components.CheckboxKt")
        every {
            KInquirer.promptCheckbox(any(), any(), any(), any(), any(), any(), any())
        } returns emptyList()

        val parser = "dummyParser"

        mockkObject(ParserService)
        every {
            ParserService.getParserSuggestions(any(), any(), any())
        } returns listOf(parser)

        val selectedParsers = InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(selectedParsers).isNotNull
        Assertions.assertThat(selectedParsers).isEmpty()
    }

    @Test
    fun `should return configured parsers after user finished configuring selection`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns "src"

        val parserWithDescription = "dummyParser - dummyDescription"
        val parserWithoutDescription = "dummyParser"
        val configuration = listOf("dummyArg")
        val parserListWithDescription = listOf(parserWithDescription)
        val parserListWithoutDescription = listOf(parserWithoutDescription)

        mockkStatic("com.github.kinquirer.components.CheckboxKt")
        every {
            KInquirer.promptCheckbox(any(), any(), any(), any(), any(), any(), any())
        } returns parserListWithDescription

        mockkObject(ParserService)
        every {
            ParserService.getParserSuggestions(any(), any(), any())
        } returns parserListWithDescription

        every {
            ParserService.configureParserSelection(any(), any(), any())
        } returns mapOf(parserWithoutDescription to configuration)

        val configuredParsers = InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        verify { ParserService.configureParserSelection(any(), any(), parserListWithoutDescription) }

        Assertions.assertThat(configuredParsers).isNotNull
        Assertions.assertThat(configuredParsers).isNotEmpty

        Assertions.assertThat(configuredParsers).containsKey(parserWithoutDescription)
        Assertions.assertThat(configuredParsers[parserWithoutDescription] == configuration).isTrue()
    }

    @Test
    fun `should return empty map when user enters empty input to scan`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns ""

        val selectedParsers = InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(selectedParsers).isNotNull
        Assertions.assertThat(selectedParsers).isEmpty()
        Assertions.assertThat(errorOut.toString()).contains("Specified invalid or empty path to analyze! Aborting...")
    }

    @Test
    fun `should return empty map when user enters nonexistent input to scan`() {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any(), any(), any())
        } returns "src/test/resources/does/not/exist"

        val selectedParsers = InteractiveParserSuggestionDialog.offerAndGetInteractiveParserSuggestionsAndConfigurations(cmdLine)

        Assertions.assertThat(selectedParsers).isNotNull
        Assertions.assertThat(selectedParsers).isEmpty()
        Assertions.assertThat(errorOut.toString()).contains("Specified invalid or empty path to analyze! Aborting...")
    }
}
