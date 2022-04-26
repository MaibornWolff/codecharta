package de.maibornwolff.codecharta.ccsh

import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.mockkObject
import io.mockk.verify
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.Assert.assertEquals
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
    fun afterTest(){
        unmockkAll()
    }

    @Test
    fun `should convert parameters to kebab-case`() {
        val outStream = ByteArrayOutputStream()
        val originalOut = System.out
        System.setErr(PrintStream(outStream))

        Ccsh.main(arrayOf("someparser", ".", "--defaultExcludesS=AbC"))

        Assertions.assertThat(outStream.toString()).contains("--default-excludes-s=AbC")
        System.setOut(originalOut)
    }

    @Test
    fun `should return help message`() {
        val ccshCLI = CommandLine(Ccsh())
        val contentOutput = StringWriter()
        ccshCLI.out = PrintWriter(contentOutput)

        val exitCode = ccshCLI.execute("-h")

        Assertions.assertThat(exitCode).isEqualTo(0)
        Assertions.assertThat(contentOutput.toString()).contains("Usage: ccsh [-hv] [COMMAND]","Command Line Interface for CodeCharta analysis")
    }

    @Test
    fun `should call interactive parser when no arguments or parameters are passed`() {
        mockkObject(ParserService)
        every {
            ParserService.selectParser(any())
        } returns "someparser"
        every {
            ParserService.executeSelectedParser(any())
        } just Runs

        Ccsh.main(emptyArray())

        verify { ParserService.executeSelectedParser(any()) }
    }

    @Test
    fun `should call interactive parser`() {
        mockkObject(ParserService)
        every {
            ParserService.selectParser(any())
        } returns "someparser"
        every {
            ParserService.executeSelectedParser(any())
        } just Runs

        Ccsh.main(emptyArray())

        verify { ParserService.executeSelectedParser(any()) }
    }
}
