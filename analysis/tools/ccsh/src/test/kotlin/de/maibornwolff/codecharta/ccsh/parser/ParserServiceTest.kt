package de.maibornwolff.codecharta.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptList
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
        fun provideArguments(): List<Arguments> {
            return listOf(
                Arguments.of("check"),
                Arguments.of("edgefilter"),
                Arguments.of("sonarimport"),
                Arguments.of("svnlogparser"),
                Arguments.of("merge"),
                Arguments.of("gitlogparser"),
                Arguments.of("rawtextparser")
                )
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
    @MethodSource("provideArguments")
    fun `should execute parser`(parser: String) {
        mockParserObject(parser)

        ParserService.executeSelectedParser(cmdLine, parser)

        verify { anyConstructed<CommandLine>().execute(any()) }
    }

    @Test
    fun `should execute modify parser`() {
        ParserService.executeSelectedParser(cmdLine, "modify")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute sourcemonitorimport parser`() {
        ParserService.executeSelectedParser(cmdLine, "sourcemonitorimport")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute csvexport parser`() {
        ParserService.executeSelectedParser(cmdLine, "csvexport")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute sourcecodeparser parser`() {
        ParserService.executeSelectedParser(cmdLine, "sourcecodeparser")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute tokeiimporter parser`() {
        ParserService.executeSelectedParser(cmdLine, "tokeiimporter")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should not execute any parser`() {

        Assertions.assertThatExceptionOfType(NoSuchElementException::class.java).isThrownBy {
            ParserService.executeSelectedParser(cmdLine, "unknownparser")
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
}
