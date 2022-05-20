package de.maibornwolff.codecharta.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.importer.sonar.SonarImporterMain
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
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
        ParserService.executeSelectedParser("check")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute merge parser`() {
        ParserService.executeSelectedParser("merge")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute edgefilter parser`() {
        mockkObject(EdgeFilter)
        every {
            EdgeFilter.main(any())
        } just Runs
        ParserService.executeSelectedParser("edgefilter")
        verify { EdgeFilter.main(emptyArray()) }
    }

    @Test
    fun `should execute modify parser`() {
        ParserService.executeSelectedParser("modify")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute sonarimport parser`() {
        mockkObject(SonarImporterMain)
        every {
            SonarImporterMain.main(any())
        } just Runs
        ParserService.executeSelectedParser("sonarimport")
        verify { SonarImporterMain.main(emptyArray()) }
    }

    @Test
    fun `should execute sourcemonitorimport parser`() {
        ParserService.executeSelectedParser("sourcemonitorimport")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute gitlogparser parser`() {
        ParserService.executeSelectedParser("gitlogparser")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute svnlogparser parser`() {
        ParserService.executeSelectedParser("svnlogparser")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute csvexport parser`() {
        ParserService.executeSelectedParser("csvexport")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute sourcecodeparser parser`() {
        ParserService.executeSelectedParser("sourcecodeparser")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute tokeiimporter parser`() {
        ParserService.executeSelectedParser("tokeiimporter")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should execute rawtextparser parser`() {
        ParserService.executeSelectedParser("rawtextparser")

        Assertions.assertThat(outContent.toString()).contains("not supported yet")
    }

    @Test
    fun `should not execute any parser`() {
        ParserService.executeSelectedParser("unkownparser")

        Assertions.assertThat(outContent.toString()).contains("No valid parser was selected.")
    }
}
