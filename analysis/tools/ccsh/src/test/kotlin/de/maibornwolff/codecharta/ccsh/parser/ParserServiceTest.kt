package de.maibornwolff.codecharta.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class ParserServiceTest {

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
        val outStream = ByteArrayOutputStream()
        val originalOut = System.out
        System.setOut(PrintStream(outStream))

        ParserService.executeSelectedParser("check")

        Assertions.assertThat(outStream.toString()).contains("Not implemented yet")
        System.setOut(originalOut)
    }

    @Test
    fun `execute merge`() {
        val outStream = ByteArrayOutputStream()
        val originalOut = System.out
        System.setOut(PrintStream(outStream))

        ParserService.executeSelectedParser("merge")

        Assertions.assertThat(outStream.toString()).contains("Not implemented yet")
        System.setOut(originalOut)
    }

    @Test
    fun `execute edgefilter`() {
        mockkObject(EdgeFilter)
        every {
            EdgeFilter.main(any())
        } just Runs
        ParserService.executeSelectedParser("edgefilter")
        verify { EdgeFilter.main(emptyArray()) }
    }
}
