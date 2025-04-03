package de.maibornwolff.codecharta.ccsh.parser

import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.ccsh.Ccsh
import de.maibornwolff.codecharta.ccsh.SessionMock.Companion.mockRunInTerminalSession
import de.maibornwolff.codecharta.ccsh.parser.repository.PicocliAnalyserRepository
import io.mockk.every
import io.mockk.mockkClass
import io.mockk.mockkConstructor
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AnalyserServiceTest {
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

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    companion object {
        @JvmStatic
        fun providerAnalyserArguments(): List<Arguments> {
            return listOf(
                Arguments.of("csvexport"),
                Arguments.of("edgefilter"),
                Arguments.of("merge"),
                Arguments.of("modify"),
                Arguments.of("codemaatimport"),
                Arguments.of("csvimport"),
                Arguments.of("sourcemonitorimport"),
                Arguments.of("gitlogparser"),
                Arguments.of("sonarimport"),
                Arguments.of("sourcecodeparser"),
                Arguments.of("svnlogparser"),
                Arguments.of("tokeiimporter"),
                Arguments.of("rawtextparser"),
                Arguments.of("check"),
                Arguments.of("inspect")
            )
        }
    }

    @ParameterizedTest
    @MethodSource("providerAnalyserArguments")
    fun `should output generated analyser command for each configured analyser`(selectedAnalyser: String) {
        val analyser = mockAnalyserObject(selectedAnalyser)

        var collectedArgs = emptyList<String>()
        testSession {
            collectedArgs = analyser.getDialog().collectAnalyserArgs(this)
        }
        val expectedAnalyserCommand =
            "ccsh " + selectedAnalyser + " " + collectedArgs.map { x -> '"' + x + '"' }.joinToString(" ")

        mockRunInTerminalSession()
        val selectedAnalyserList = listOf(selectedAnalyser)
        val mockPicocliAnalyserRepository = mockAnalyserRepository(selectedAnalyser, emptyList())

        AnalyserService.configureAnalyserSelection(cmdLine, mockPicocliAnalyserRepository, selectedAnalyserList)

        assertThat(outContent.toString()).contains(expectedAnalyserCommand)
    }

    @Test
    fun `should throw error in case a analyser is selected that does not exist`() {
        val repository = PicocliAnalyserRepository()
        val selectedAnalyser = "invalidAnalyser"
        assertThrows<IllegalArgumentException> {
            AnalyserService.configureAnalyserSelection(cmdLine, repository, listOf(selectedAnalyser))
        }
    }

    @Test
    fun `selectAnalyser should extract the passed analyser for return`() {
        val fakeAnalyser = "selectedAnalyser"
        val fakeAnalyserDescription = "This is a test analyser. Please Stand by"
        mockkObject(InteractiveDialog)
        every { InteractiveDialog.askAnalyserToExecute(any(), any()) } returns "$fakeAnalyser $fakeAnalyserDescription"

        mockRunInTerminalSession()

        val selectedAnalyser = AnalyserService.selectAnalyser(cmdLine, PicocliAnalyserRepository())

        assertThat(selectedAnalyser).isEqualTo(fakeAnalyser)
    }

    @Test
    fun `should output empty list for analyser suggestions if no usable analysers were found`() { // Analyser name is chosen arbitrarily
        val mockAnalyserRepository = mockAnalyserRepository("check", emptyList())

        val usableAnalysers = AnalyserService.getAnalyserSuggestions(cmdLine, mockAnalyserRepository, "dummy")

        assertThat(usableAnalysers).isNotNull
        assertThat(usableAnalysers).isEmpty()
    }

    @Test
    fun `should output analyser name list of user selected analysers from analyser suggestions`() {
        val expectedUsualAnalysers = listOf("check", "validate") // Analyser name is chosen arbitrarily
        val mockAnalyserRepository = mockAnalyserRepository("check", expectedUsualAnalysers)
        val actualUsableAnalysers = AnalyserService.getAnalyserSuggestions(cmdLine, mockAnalyserRepository, "dummy")

        assertThat(actualUsableAnalysers).isNotNull
        assertThat(actualUsableAnalysers).isNotEmpty

        assertThat(actualUsableAnalysers).contains("check")
        assertThat(actualUsableAnalysers).contains("validate")
    }

    @Test
    fun `should start configuration for each selected analyser`() {
        val selectedAnalyserList =
            listOf(
                "check",
                "inspect",
                "edgefilter",
                "sonarimport",
                "svnlogparser",
                "merge",
                "gitlogparser",
                "rawtextparser",
                "sourcemonitorimport",
                "tokeiimporter",
                "sourcecodeparser",
                "modify",
                "csvexport",
                "codemaatimport",
                "csvimport"
            )

        mockRunInTerminalSession()

        val mockPicocliAnalyserRepository = mockAnalyserRepository(selectedAnalyserList[0], emptyList())

        val configuredAnalysers =
            AnalyserService.configureAnalyserSelection(cmdLine, mockPicocliAnalyserRepository, selectedAnalyserList)

        assertThat(configuredAnalysers).isNotEmpty
        assertThat(configuredAnalysers).size().isEqualTo(selectedAnalyserList.size)

        for (entry in configuredAnalysers) {
            assertThat(entry.value).isNotEmpty
            assertThat(entry.value[0] == "dummyArg").isTrue()
        }
    }

    @ParameterizedTest
    @MethodSource("providerAnalyserArguments")
    fun `should execute analyser`(analyser: String) {
        mockAnalyserObject(analyser)
        mockRunInTerminalSession()

        AnalyserService.executeSelectedAnalyser(cmdLine, analyser)

        verify { anyConstructed<CommandLine>().execute(any()) }
    }

    @ParameterizedTest
    @MethodSource("providerAnalyserArguments")
    fun `should execute preconfigured analyser`(analyser: String) {
        val analyserObject = mockAnalyserObject(analyser)

        var analyserArgs = emptyList<String>()
        testSession {
            analyserArgs = analyserObject.getDialog().collectAnalyserArgs(this)
        }

        AnalyserService.executePreconfiguredAnalyser(cmdLine, Pair(analyser, analyserArgs))

        verify { anyConstructed<CommandLine>().execute(any()) }
    }

    @Test
    fun `should not execute any analyser`() {
        Assertions.assertThatExceptionOfType(NoSuchElementException::class.java).isThrownBy {
            AnalyserService.executeSelectedAnalyser(cmdLine, "unknownanalyser")
        }

        Assertions.assertThatExceptionOfType(NoSuchElementException::class.java).isThrownBy {
            AnalyserService.executePreconfiguredAnalyser(cmdLine, Pair("unknownanalyser", listOf("dummyArg")))
        }
    }

    @ParameterizedTest
    @MethodSource("providerAnalyserArguments")
    fun `should output message informing about which analyser is being configured`(analyser: String) {
        mockRunInTerminalSession()

        val mockAnalyserRepository = mockAnalyserRepository(analyser, listOf(analyser))

        AnalyserService.configureAnalyserSelection(cmdLine, mockAnalyserRepository, listOf(analyser))

        assertThat(outContent.toString()).contains("Now configuring $analyser.")
    }

    private fun mockAnalyserObject(name: String): AnalyserInterface {
        val obj = cmdLine.subcommands[name]!!.commandSpec.userObject() as AnalyserInterface
        mockkObject(obj)
        val dialogInterface = mockkClass(AnalyserDialogInterface::class)
        val dummyArgs = listOf("dummyArg")

        every {
            dialogInterface.collectAnalyserArgs(any())
        } returns dummyArgs
        every {
            obj.getDialog()
        } returns dialogInterface
        mockkConstructor(CommandLine::class)
        every { anyConstructed<CommandLine>().execute(*dummyArgs.toTypedArray()) } returns 0
        return obj
    }

    private fun mockAnalyserRepository(mockAnalyserName: String, usableAnalysers: List<String>): PicocliAnalyserRepository {
        val obj = mockkClass(PicocliAnalyserRepository::class)

        every {
            obj.getAnalyserInterface(any(), any())
        } returns mockAnalyserObject(mockAnalyserName)

        every {
            obj.getAllAnalyserInterfaces(any())
        } returns emptyList()

        every {
            obj.getApplicableAnalyserNamesWithDescription(any(), any())
        } returns usableAnalysers

        return obj
    }
}
