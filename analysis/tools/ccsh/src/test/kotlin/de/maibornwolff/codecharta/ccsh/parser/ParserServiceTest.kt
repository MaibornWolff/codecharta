package de.maibornwolff.codecharta.ccsh.parser

import de.maibornwolff.codecharta.tools.ccsh.Ccsh
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
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
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
                Arguments.of("check"),
                Arguments.of("edgefilter"),
                Arguments.of("sonarimport"),
                Arguments.of("svnlogparser"),
                Arguments.of("merge"),
                Arguments.of("gitlogparser"),
                Arguments.of("rawtextparser"),
                Arguments.of("sourcemonitorimport"),
                Arguments.of("tokeiimporter"),
                Arguments.of("sourcecodeparser"),
                Arguments.of("modify"),
                Arguments.of("csvexport"),
                Arguments.of("codemaatimport"),
            )
        }
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should output generated parser command for each configured parser`(selectedParser: String) {
        val parser = mockParserObject(selectedParser)

        val collectedArgs = parser.getDialog().collectParserArgs()
        val expectedParserCommand = "ccsh " + selectedParser + " " + collectedArgs.map { x -> '"' + x + '"' }.joinToString(" ")

        val selectedParserList = listOf(selectedParser)
        val mockPicocliParserRepository = mockParserRepository(selectedParser)

        ParserService.configureParserSelection(cmdLine, mockPicocliParserRepository, selectedParserList)

        Assertions.assertThat(outContent.toString())
                .contains(expectedParserCommand)
    }

    @Test
    fun `should start configuration for each selected parser`() {
        val selectedParserList = listOf("check",
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
                "codemaatimport")
        val mockPicocliParserRepository = mockParserRepository(selectedParserList[0])

        val configuredParsers = ParserService.configureParserSelection(cmdLine, mockPicocliParserRepository, selectedParserList)

        Assertions.assertThat(configuredParsers).isNotEmpty
        Assertions.assertThat(configuredParsers).size().isEqualTo(selectedParserList.size)

        for (entry in configuredParsers) {
            Assertions.assertThat(entry.value).isNotEmpty
            Assertions.assertThat(entry.value[0] == "dummyArg").isTrue()
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

        ParserService.executePreconfiguredParser(cmdLine, Pair(parser, parserObject.getDialog().collectParserArgs()))

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

    private fun mockParserObject(name: String): InteractiveParser {
        val obj = cmdLine.subcommands[name]!!.commandSpec.userObject() as InteractiveParser
        mockkObject(obj)
        val dialogInterface = mockkClass(ParserDialogInterface::class)
        val dummyArgs = listOf("dummyArg")
        every {
            dialogInterface.collectParserArgs()
        } returns dummyArgs
        every {
            obj.getDialog()
        } returns dialogInterface
        mockkConstructor(CommandLine::class)
        every { anyConstructed<CommandLine>().execute(*dummyArgs.toTypedArray()) } returns 0
        return obj
    }

    private fun mockParserRepository(mockParserName: String): PicocliParserRepository {
        val obj = mockkClass(PicocliParserRepository::class)

        every {
            obj.getParser(any(), any())
        } returns mockParserObject(mockParserName)

        return obj
    }
}
