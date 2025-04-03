package de.maibornwolff.codecharta.ccsh

import de.maibornwolff.codecharta.ccsh.SessionMock.Companion.mockRunInTerminalSession
import de.maibornwolff.codecharta.ccsh.analyser.AnalyserService
import de.maibornwolff.codecharta.ccsh.analyser.InteractiveAnalyserSuggestion
import de.maibornwolff.codecharta.ccsh.analyser.InteractiveDialog
import de.maibornwolff.codecharta.util.Logger
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@Timeout(120)
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

    private fun mockSuccessfulAnalyserService() {
        mockkObject(AnalyserService)
        every {
            AnalyserService.selectAnalyser(any(), any())
        } returns "someanalyser"

        every {
            AnalyserService.executeSelectedAnalyser(any(), any())
        } returns 0

        every {
            AnalyserService.executePreconfiguredAnalyser(any(), any())
        } returns 0
    }

    private fun mockUnsuccessfulAnalyserService() {
        mockkObject(AnalyserService)

        every {
            AnalyserService.executeSelectedAnalyser(any(), any())
        } returns -1

        every {
            AnalyserService.executePreconfiguredAnalyser(any(), any())
        } returns -1
    }

    private fun mockAnalyserSuggestionDialog(selectedAnalysers: List<String>, analyserArgs: List<List<String>>) {
        if (selectedAnalysers.size != analyserArgs.size) {
            throw IllegalArgumentException("There must be the same amount of args as analysers!")
        }

        val analysersAndArgs = mutableMapOf<String, List<String>>()
        selectedAnalysers.zip(analyserArgs) { currentAnalyserName, currentAnalyserArgs ->
            analysersAndArgs.put(currentAnalyserName, currentAnalyserArgs)
        }

        mockkObject(InteractiveAnalyserSuggestion)
        every {
            InteractiveAnalyserSuggestion.offerAndGetAnalyserSuggestionsAndConfigurations(any())
        } returns analysersAndArgs
    }

    private fun mockPrepareInteractiveDialog() {
        mockkObject(InteractiveDialog)
    }

    private fun mockDialogMergeResults(shouldMerge: Boolean) {
        every { InteractiveDialog.askForMerge(any()) } returns shouldMerge
    }

    private fun mockDialogRunAnalysers(shouldRun: Boolean) {
        every { InteractiveDialog.askRunAnalysers(any()) } returns shouldRun
    }

    private fun mockDialogResultLocation(pathToReturn: String) {
        every { InteractiveDialog.askJsonPath(any()) } returns pathToReturn
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
        assertThat(exitCode).isNotZero()
        assertThat(outStream.toString()).contains("--default-excludes-s=AbC")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should only show help message when executed with help flag`() {
        // given
        mockkObject(AnalyserService)
        val outStream = ByteArrayOutputStream()
        val originalOut = System.out
        System.setOut(PrintStream(outStream))

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("-h"))

        // then
        assertThat(exitCode).isEqualTo(0)
        assertThat(outStream.toString())
            .contains("Usage: ccsh [-hiv] [COMMAND]", "Command Line Interface for CodeCharta analysis")
        verify(exactly = 0) { AnalyserService.executePreconfiguredAnalyser(any(), any()) }

        // clean up
        System.setOut(originalOut)
    }

    @Test
    fun `should show version and copyright when executed with version flag`() {
        // given
        mockkObject(AnalyserService)
        val outStream = ByteArrayOutputStream()
        val originalOut = System.out
        System.setOut(PrintStream(outStream))

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("-v"))

        // then
        assertThat(exitCode).isEqualTo(0)
        // The actual printed version is null, as well as the package name, as it is not set for this test class
        assertThat(outStream.toString()).contains("version", "Copyright(c) 2024, MaibornWolff GmbH")
        verify(exactly = 0) { AnalyserService.executePreconfiguredAnalyser(any(), any()) }

        // clean up
        System.setOut(originalOut)
    }

    @Test
    fun `should execute analyser suggestions and all selected analyser when no options are passed`() {
        // given
        val selectedAnalysers = listOf("analyser1", "analyser2")
        val args = listOf(listOf("dummyArg1"), listOf("dummyArg2"))

        mockRunInTerminalSession()
        mockAnalyserSuggestionDialog(selectedAnalysers, args)
        mockSuccessfulAnalyserService()
        mockPrepareInteractiveDialog()
        mockDialogRunAnalysers(true)
        mockDialogMergeResults(true)
        mockDialogResultLocation("dummy/path")

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        assertThat(exitCode).isZero // 3 because 2 analysers and the merge in the end
        verify(exactly = 3) { AnalyserService.executePreconfiguredAnalyser(any(), any()) }
    }

    @Test
    fun `should only execute analysers when configuration was successful`() {
        // given
        mockAnalyserSuggestionDialog(emptyList(), emptyList())
        mockSuccessfulAnalyserService()

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        assertThat(exitCode == 0).isTrue()
        verify(exactly = 0) { AnalyserService.executeSelectedAnalyser(any(), any()) }
        verify(exactly = 0) { AnalyserService.executePreconfiguredAnalyser(any(), any()) }
    }

    @Test
    fun `should only execute analysers when user does confirm execution`() {
        // given
        val selectedAnalysers = listOf("analyser1", "analyser2")
        val args = listOf(listOf("dummyArg1"), listOf("dummyArg2"))

        mockRunInTerminalSession()
        mockAnalyserSuggestionDialog(selectedAnalysers, args)
        mockSuccessfulAnalyserService()
        mockPrepareInteractiveDialog()
        mockDialogRunAnalysers(false)

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        assertThat(exitCode == 0).isTrue()
        verify(exactly = 0) { AnalyserService.executeSelectedAnalyser(any(), any()) }
        verify(exactly = 0) { AnalyserService.executePreconfiguredAnalyser(any(), any()) }
    }

    @Test
    fun `should continue executing analysers even when one analyser throws an error`() {
        // given
        mockUnsuccessfulAnalyserService()
        val dummyConfiguredAnalysers =
            mapOf(
                "dummyAnalyser1" to listOf("dummyArg1", "dummyArg2"),
                "dummyAnalyser2" to listOf("dummyArg1", "dummyArg2")
            )

        // when
        Ccsh.executeConfiguredAnalysers(cmdLine, dummyConfiguredAnalysers)

        // then
        verify(exactly = 2) { AnalyserService.executePreconfiguredAnalyser(any(), any()) }
        verify(exactly = 0) { AnalyserService.executeSelectedAnalyser(any(), any()) }
    }

    @Test
    fun `should execute interactive analyser when passed analyser is unknown`() {
        // given
        mockSuccessfulAnalyserService()

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("unknownanalyser"))

        // then
        assertThat(exitCode).isZero
        verify { AnalyserService.executeSelectedAnalyser(any(), any()) }
    }

    @Test
    fun `should execute interactive analyser when -i option is passed`() {
        // given
        mockSuccessfulAnalyserService()

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("-i"))

        // then
        assertThat(exitCode).isZero
        verify { AnalyserService.executeSelectedAnalyser(any(), any()) }
    }

    @Test
    fun `should execute the selected interactive analyser when only called with name and no args`() {
        // given
        mockSuccessfulAnalyserService()

        // when
        val exitCode = Ccsh.executeCommandLine(arrayOf("sonarimport"))

        // then
        assertThat(exitCode).isEqualTo(0)
        assertThat(errContent.toString()).contains("Executing sonarimport")
    }

    @Test
    fun `should not ask for merging results after using analyser suggestions when only one analyser was executed`() {
        // given
        val selectedAnalysers = listOf("analyser1")
        val args = listOf(listOf("dummyArg1"))

        mockRunInTerminalSession()
        mockAnalyserSuggestionDialog(selectedAnalysers, args)
        mockSuccessfulAnalyserService()
        mockPrepareInteractiveDialog()
        mockDialogRunAnalysers(true)

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        assertThat(exitCode).isZero()
        assertThat(errContent.toString()).contains("Analyser was successfully executed.")
    }

    @Test
    fun `should log the absolute path of the merged output file when asked to merge results`() {
        // given
        val folderPath = "src/test/resources/mergefiles"
        val outputFilePath = "$folderPath/mergedResult.cc.json.gz"
        val absoluteOutputFilePath = File(outputFilePath).absolutePath
        val outputFile = File(outputFilePath)
        outputFile.deleteOnExit()
        val multipleConfiguredAnalysers =
            mapOf(
                "dummyAnalyser1" to listOf("dummyArg1", "dummyArg2"),
                "dummyAnalyser2" to listOf("dummyArg1", "dummyArg2")
            )

        val lambdaSlot = mutableListOf<() -> String>()
        mockkObject(Logger)
        every { Logger.info(capture(lambdaSlot)) } returns Unit

        mockRunInTerminalSession()
        mockPrepareInteractiveDialog()
        mockDialogRunAnalysers(true)
        mockDialogMergeResults(true)
        mockDialogResultLocation(folderPath)

        // when
        Ccsh.executeConfiguredAnalysers(cmdLine, multipleConfiguredAnalysers)

        // then
        assertThat(lambdaSlot.last()().endsWith(absoluteOutputFilePath)).isTrue()
    }

    @Test
    fun `should return zero if users chooses not to merge`() {
        val multipleConfiguredAnalysers =
            mapOf(
                "dummyAnalyser1" to listOf("dummyArg1", "dummyArg2"),
                "dummyAnalyser2" to listOf("dummyArg1", "dummyArg2")
            )

        mockRunInTerminalSession()
        mockPrepareInteractiveDialog()
        mockDialogRunAnalysers(true)
        mockDialogMergeResults(false)

        // when
        val resultCode = Ccsh.executeConfiguredAnalysers(cmdLine, multipleConfiguredAnalysers)

        // then
        assertThat(resultCode).isEqualTo(0)
    }

    @Test
    fun `should log the absolute path of the merged output file when one out of two analysers prints output to stdout`() {
        val folderPath = "src/test/resources/sampleproject"
        val mergedOutputFilePath = "$folderPath/mergedResult.cc.json.gz"
        val mergedOutputFile = File(mergedOutputFilePath)
        val sourcecodeOutputFilePath = "$folderPath/source.cc.json"
        val sourcecodeOutputFile = File(sourcecodeOutputFilePath)
        mergedOutputFile.deleteOnExit()
        sourcecodeOutputFile.deleteOnExit()

        val selectedAnalysers = listOf("rawtextparser", "sourcecodeparser")
        val args =
            listOf(
                listOf(File(folderPath).absolutePath, "--output-file="),
                listOf(
                    File(folderPath).absolutePath,
                    "--format=JSON",
                    "--output-file=$sourcecodeOutputFilePath",
                    "--no-issues",
                    "--default-excludes",
                    "--not-compressed"
                )
            )

        mockRunInTerminalSession()
        mockAnalyserSuggestionDialog(selectedAnalysers, args)
        mockPrepareInteractiveDialog()
        mockDialogRunAnalysers(true)
        mockDialogMergeResults(true)
        mockDialogResultLocation(File(folderPath).absolutePath)

        // when
        val exitCode = Ccsh.executeCommandLine(emptyArray())

        // then
        assertThat(exitCode).isZero()
        assertThat(mergedOutputFile).exists()
    }
}
