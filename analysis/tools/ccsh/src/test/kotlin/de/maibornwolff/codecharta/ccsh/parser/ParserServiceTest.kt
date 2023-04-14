package de.maibornwolff.codecharta.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptCheckbox
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.importer.codemaat.CodeMaatImporter
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import io.mockk.every
import io.mockk.mockkClass
import io.mockk.mockkConstructor
import io.mockk.mockkObject
import io.mockk.mockkStatic
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

        // TODO: Complete these Arguments to make sense
        @JvmStatic
        fun provideInputFileArguments(): List<Arguments> {
            return listOf(
                    Arguments.of("https://www.somewebsite.com"),
                    Arguments.of("www.somewebsite.com"),
                    Arguments.of("somewebsite.com"),
                    Arguments.of("/my/git/repo"),
                    Arguments.of("/my/git/repo/"),
                    Arguments.of("/my/sonar/scanned/repo/"))
        }
    }

    @Test
    fun `should return the selected parser name`() {
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns "parser - description"

        val selectedParserName = ParserService.selectParser(CommandLine(Ccsh()))

        Assertions.assertThat(selectedParserName).isEqualTo("parser")
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should execute parser`(parser: String) {
        mockParserObject(parser)

        ParserService.executeSelectedParser(cmdLine, parser)

        verify { anyConstructed<CommandLine>().execute(any()) }
    }

    @Test
    fun `should not execute any parser`() {

        Assertions.assertThatExceptionOfType(NoSuchElementException::class.java).isThrownBy {
            ParserService.executeSelectedParser(cmdLine, "unknownparser")
        }
    }

    // TODO: This test does not make any sense right now, I will completely rework that before merging the automatic suggestion pr
    @ParameterizedTest
    @MethodSource("provideInputFileArguments")
    fun `should suggest usable parsers for valid input`(inputFile : String) {
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptCheckbox(any(), any(), any(), any(), any())
        } returns (ParserService.getUsableParsers(cmdLine, inputFile))

        val suggestedParsers = ParserService.offerParserSuggestions(cmdLine, inputFile)

        Assertions.assertThat(suggestedParsers).isNotNull
        Assertions.assertThat(suggestedParsers).isNotEmpty
    }

    @Test
    fun `should return all usable parsers by name`() {

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
}
