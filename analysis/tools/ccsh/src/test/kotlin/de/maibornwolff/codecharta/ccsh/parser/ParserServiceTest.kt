package de.maibornwolff.codecharta.ccsh.parser

import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.InteractiveDialog
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import de.maibornwolff.codecharta.tools.ccsh.parser.repository.PicocliParserRepository
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
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
class ParserServiceTest {
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
        fun providerParserArguments(): List<Arguments> {
            return listOf(
                Arguments.of("csvexport"),
                Arguments.of("edgefilter"),
                Arguments.of("merge"),
                Arguments.of("modify"),
                Arguments.of("codemaatimport"),
                Arguments.of("csvimport"),
                Arguments.of("sourcemonitorimport"),
                Arguments.of("gitlogparser"),
                Arguments.of("metricgardenerimport"),
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
    @MethodSource("providerParserArguments")
    fun `should output generated parser command for each configured parser`(selectedParser: String) {
        val parser = mockParserObject(selectedParser)

        var collectedArgs = emptyList<String>()
        testSession {
            collectedArgs = parser.getDialog().collectParserArgs(this)
        }
        val expectedParserCommand =
            "ccsh " + selectedParser + " " + collectedArgs.map { x -> '"' + x + '"' }.joinToString(" ")

        val selectedParserList = listOf(selectedParser)
        val mockPicocliParserRepository = mockParserRepository(selectedParser, emptyList())

        ParserService.configureParserSelection(cmdLine, mockPicocliParserRepository, selectedParserList)

        assertThat(outContent.toString()).contains(expectedParserCommand)
    }

    @Test
    fun `should throw error in case a parser is selected that does not exist`() {
        val repository = PicocliParserRepository()
        val selectedParser = "invalidParser"
        assertThrows<IllegalArgumentException> {
            ParserService.configureParserSelection(cmdLine, repository, listOf(selectedParser))
        }
    }

    @Test
    fun `selectParser should extract the passed parser for return`() {
        val fakeParser = "selectedParser"
        val fakeParserDescription = "This is a test parser. Please Stand by"
        mockkObject(InteractiveDialog)
        every { InteractiveDialog.callAskParserToExecute(any()) } returns "$fakeParser $fakeParserDescription"

        val selectedParser = ParserService.selectParser(cmdLine, PicocliParserRepository())

        assertThat(selectedParser).isEqualTo(fakeParser)
    }

    @Test
    fun `should inform user if interactive mode is not supported for selected parser`() {
        val selectedParserName = "selectedParser"
        val fakeCMDline = CommandLine(NotInteractiveParserTest())

        var resultCode = ParserService.executeSelectedParser(fakeCMDline, selectedParserName)
        assertThat(resultCode).isEqualTo(ParserService.EXIT_CODE_PARSER_NOT_SUPPORTED)

        resultCode = ParserService.executePreconfiguredParser(fakeCMDline, Pair(selectedParserName, listOf(selectedParserName)))

        assertThat(resultCode).isEqualTo(ParserService.EXIT_CODE_PARSER_NOT_SUPPORTED)
    }

    @Test
    fun `should output empty list for parser suggestions if no usable parsers were found`() { // Parser name is chosen arbitrarily
        val mockParserRepository = mockParserRepository("check", emptyList())

        val usableParsers = ParserService.getParserSuggestions(cmdLine, mockParserRepository, "dummy")

        assertThat(usableParsers).isNotNull
        assertThat(usableParsers).isEmpty()
    }

    @Test
    fun `should output parser name list of user selected parsers from parser suggestions`() {
        val expectedUsualParsers = listOf("check", "validate") // Parser name is chosen arbitrarily
        val mockParserRepository = mockParserRepository("check", expectedUsualParsers)
        val actualUsableParsers = ParserService.getParserSuggestions(cmdLine, mockParserRepository, "dummy")

        assertThat(actualUsableParsers).isNotNull
        assertThat(actualUsableParsers).isNotEmpty

        assertThat(actualUsableParsers).contains("check")
        assertThat(actualUsableParsers).contains("validate")
    }

    @Test
    fun `should start configuration for each selected parser`() {
        val selectedParserList =
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
                "metricgardenerimport",
                "csvimport"
            )

        val mockPicocliParserRepository = mockParserRepository(selectedParserList[0], emptyList())

        val configuredParsers =
            ParserService.configureParserSelection(cmdLine, mockPicocliParserRepository, selectedParserList)

        assertThat(configuredParsers).isNotEmpty
        assertThat(configuredParsers).size().isEqualTo(selectedParserList.size)

        for (entry in configuredParsers) {
            assertThat(entry.value).isNotEmpty
            assertThat(entry.value[0] == "dummyArg").isTrue()
        }
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should execute parser`(parser: String) {
        mockParserObject(parser)

        ParserService.executeSelectedParser(cmdLine, parser)

        verify { anyConstructed<CommandLine>().execute(any()) }
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should execute preconfigured parser`(parser: String) {
        val parserObject = mockParserObject(parser)

        var parserArgs = emptyList<String>()
        testSession {
            parserArgs = parserObject.getDialog().collectParserArgs(this)
        }

        ParserService.executePreconfiguredParser(cmdLine, Pair(parser, parserArgs))

        verify { anyConstructed<CommandLine>().execute(any()) }
    }

    @Test
    fun `should not execute any parser`() {
        Assertions.assertThatExceptionOfType(NoSuchElementException::class.java).isThrownBy {
            ParserService.executeSelectedParser(cmdLine, "unknownparser")
        }

        Assertions.assertThatExceptionOfType(NoSuchElementException::class.java).isThrownBy {
            ParserService.executePreconfiguredParser(cmdLine, Pair("unknownparser", listOf("dummyArg")))
        }
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should output message informing about which parser is being configured`(parser: String) {
        val mockParserRepository = mockParserRepository(parser, listOf(parser))

        ParserService.configureParserSelection(cmdLine, mockParserRepository, listOf(parser))

        assertThat(outContent.toString()).contains("Now configuring $parser.")
    }

    private fun mockParserObject(name: String): InteractiveParser {
        val obj = cmdLine.subcommands[name]!!.commandSpec.userObject() as InteractiveParser
        mockkObject(obj)
        val dialogInterface = mockkClass(ParserDialogInterface::class)
        val dummyArgs = listOf("dummyArg")

        every {
            dialogInterface.collectParserArgs(any())
        } returns dummyArgs
        every {
            obj.getDialog()
        } returns dialogInterface
        mockkConstructor(CommandLine::class)
        every { anyConstructed<CommandLine>().execute(*dummyArgs.toTypedArray()) } returns 0
        return obj
    }

    private fun mockParserRepository(mockParserName: String, usableParsers: List<String>): PicocliParserRepository {
        val obj = mockkClass(PicocliParserRepository::class)

        every {
            obj.getInteractiveParser(any(), any())
        } returns mockParserObject(mockParserName)

        every {
            obj.getAllInteractiveParsers(any())
        } returns emptyList()

        every {
            obj.getApplicableInteractiveParserNamesWithDescription(any(), any())
        } returns usableParsers

        return obj
    }
}
