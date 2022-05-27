package de.maibornwolff.codecharta.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
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

    @Test
    fun `should return the selected parser name`() {
        mockkStatic("com.github.kinquirer.components.ListKt")
        every {
            KInquirer.promptList(any(), any(), any(), any(), any())
        } returns "parser - description"

        val selectedParserName = ParserService.selectParser(CommandLine(Ccsh()))

        Assertions.assertThat(selectedParserName).isEqualTo("parser")
    }

    @Test
    fun `should execute check parser`() {
        val parser = mockParserObject("check")
        every {
            parser.executeWithInteractiveDialog()
        } just Runs

        ParserService.executeSelectedParser(cmdLine, "check")
        verify { parser.executeWithInteractiveDialog() }
    }

    @Test
    fun `should execute merge parser`() {
        ParserService.executeSelectedParser(cmdLine, "merge")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute edgefilter parser`() {
        val parser = mockParserObject("edgefilter")
        every {
            parser.executeWithInteractiveDialog()
        } just Runs

        ParserService.executeSelectedParser(cmdLine, "edgefilter")
        verify { parser.executeWithInteractiveDialog() }
    }

    @Test
    fun `should execute modify parser`() {
        ParserService.executeSelectedParser(cmdLine, "modify")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute sonarimport parser`() {
        ParserService.executeSelectedParser(cmdLine, "sonarimport")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute sourcemonitorimport parser`() {
        ParserService.executeSelectedParser(cmdLine, "sourcemonitorimport")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute gitlogparser parser`() {
        ParserService.executeSelectedParser(cmdLine, "gitlogparser")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute svnlogparser parser`() {
        ParserService.executeSelectedParser(cmdLine, "svnlogparser")

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
    fun `should execute rawtextparser parser`() {
        ParserService.executeSelectedParser(cmdLine, "rawtextparser")

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
        return obj
    }
}
