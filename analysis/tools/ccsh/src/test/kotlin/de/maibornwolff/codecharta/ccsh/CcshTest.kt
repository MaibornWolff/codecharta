package de.maibornwolff.codecharta.ccsh

import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.PrintStream
import java.io.PrintWriter
import java.io.StringWriter

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CcshTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should convert arguments to kebab-case`() {
        val outStream = ByteArrayOutputStream()
        val originalOut = System.out
        System.setErr(PrintStream(outStream))
        val exitCode = Ccsh.executeCommandLine(arrayOf("edgefilter", ".", "--defaultExcludesS=AbC"))

        Assertions.assertThat(exitCode).isNotZero
        Assertions.assertThat(outStream.toString()).contains("--default-excludes-s=AbC")
        System.setOut(originalOut)
    }

    @Test
    fun `should just show help message`() {
        mockkObject(ParserService)
        val ccshCLI = CommandLine(Ccsh())
        val contentOutput = StringWriter()
        ccshCLI.out = PrintWriter(contentOutput)

        val exitCode = ccshCLI.execute("-h")

        Assertions.assertThat(exitCode).isEqualTo(0)
        Assertions.assertThat(contentOutput.toString()).contains("Usage: ccsh [-hv] [COMMAND]", "Command Line Interface for CodeCharta analysis")
        verify(exactly = 0) { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should start interactive parser when no arguments or parameters are passed`() {
        mockkObject(ParserService)
        every {
            ParserService.selectParser(any())
        } returns "someparser"
        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0

        Ccsh.main(emptyArray())

        verify { ParserService.executeSelectedParser(any(), any()) }
    }

    @Test
    fun `should execute interactive parser when passed parser is unknown`() {
        mockkObject(ParserService)
        every {
            ParserService.selectParser(any())
        } returns "someparser"
        every {
            ParserService.executeSelectedParser(any(), any())
        } returns 0

        Ccsh.main(arrayOf("unknownparser"))

        verify { ParserService.executeSelectedParser(any(), any()) }
    }
}
