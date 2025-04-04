package de.maibornwolff.codecharta.ccsh.analyser

import de.maibornwolff.codecharta.ccsh.Ccsh
import de.maibornwolff.codecharta.ccsh.SessionMock.Companion.mockRunInTerminalSession
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
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
class InteractiveAnalyserSuggestionTest {
    private val outContent = ByteArrayOutputStream()
    private val errContent = ByteArrayOutputStream()
    private val cmdLine = CommandLine(Ccsh())

    @BeforeAll
    fun setUpStreams() {
        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
    }

    @AfterAll
    fun restoreStreams() {
        System.setOut(System.out)
        System.setErr(System.err)
    }

    @BeforeEach
    fun beforeTest() {
        mockRunInTerminalSession()
    }

    @AfterEach
    fun afterTest() {
        outContent.reset()
        errContent.reset()
        unmockkAll()
    }

    private fun mockPrepareInteractiveDialog() {
        mockkObject(InteractiveDialog)
    }

    private fun mockDialogScannerPath(pathToReturn: String) {
        every { InteractiveDialog.askForPath(any()) } returns pathToReturn
    }

    private fun mockDialogApplicableAnalyserSelection(analyserSelection: List<String>) {
        every { InteractiveDialog.askApplicableAnalyser(any(), any()) } returns analyserSelection
    }

    @Test
    fun `should only output message when no usable analysers were found`() {
        mockPrepareInteractiveDialog()
        mockDialogScannerPath("src")
        mockkObject(AnalyserService)
        every {
            AnalyserService.getAnalyserSuggestions(any(), any(), any())
        } returns emptyList()

        val usableAnalysers =
            InteractiveAnalyserSuggestion.offerAndGetAnalyserSuggestionsAndConfigurations(cmdLine)

        assertThat(errContent.toString()).contains(Ccsh.NO_USABLE_ANALYSER_FOUND_MESSAGE)
        assertThat(usableAnalysers).isNotNull
        assertThat(usableAnalysers).isEmpty()
    }

    @Test
    fun `should return empty map when user does not select any analyser`() {
        mockPrepareInteractiveDialog()
        mockDialogScannerPath("src/test/resources/sampleproject/foo.java")
        mockDialogApplicableAnalyserSelection(emptyList())

        val analyser = "dummyAnalyser"

        mockkObject(AnalyserService)
        every {
            AnalyserService.getAnalyserSuggestions(any(), any(), any())
        } returns listOf(analyser)

        val selectedAnalysers =
            InteractiveAnalyserSuggestion.offerAndGetAnalyserSuggestionsAndConfigurations(cmdLine)

        assertThat(selectedAnalysers).isNotNull
        assertThat(selectedAnalysers).isEmpty()
    }

    @Test
    fun `should return configured analysers after user finished configuring selection`() {
        val analyserWithDescription = "dummyAnalyser - dummyDescription"
        val analyserWithoutDescription = "dummyAnalyser"
        val configuration = listOf("dummyArg")
        val analyserListWithDescription = listOf(analyserWithDescription)
        val analyserListWithoutDescription = listOf(analyserWithoutDescription)

        mockPrepareInteractiveDialog()
        mockDialogApplicableAnalyserSelection(analyserListWithDescription)
        mockDialogScannerPath("src")

        mockkObject(AnalyserService)
        every {
            AnalyserService.getAnalyserSuggestions(any(), any(), any())
        } returns analyserListWithDescription

        every {
            AnalyserService.configureAnalyserSelection(any(), any(), any())
        } returns mapOf(analyserWithoutDescription to configuration)

        val configureAnalysers =
            InteractiveAnalyserSuggestion.offerAndGetAnalyserSuggestionsAndConfigurations(cmdLine)

        verify { AnalyserService.configureAnalyserSelection(any(), any(), analyserListWithoutDescription) }

        assertThat(configureAnalysers).isNotNull
        assertThat(configureAnalysers).isNotEmpty

        assertThat(configureAnalysers).containsKey(analyserWithoutDescription)
        assertThat(configureAnalysers[analyserWithoutDescription] == configuration).isTrue()
    }

    @Test
    fun `should return empty map when user enters empty input to scan`() {
        mockPrepareInteractiveDialog()
        mockDialogScannerPath("")

        val selectedAnalysers =
            InteractiveAnalyserSuggestion.offerAndGetAnalyserSuggestionsAndConfigurations(cmdLine)

        assertThat(selectedAnalysers).isNotNull
        assertThat(selectedAnalysers).isEmpty()
        assertThat(errContent.toString()).contains("Specified invalid or empty path to analyze! Aborting...")
    }

    @Test
    fun `should return empty map when user enters nonexistent input to scan`() {
        mockPrepareInteractiveDialog()
        mockDialogScannerPath("src/test/resources/does/not/exist")

        val selectedAnalysers =
            InteractiveAnalyserSuggestion.offerAndGetAnalyserSuggestionsAndConfigurations(cmdLine)

        assertThat(selectedAnalysers).isNotNull
        assertThat(selectedAnalysers).isEmpty()
        assertThat(errContent.toString()).contains("Specified invalid or empty path to analyze! Aborting...")
    }
}
