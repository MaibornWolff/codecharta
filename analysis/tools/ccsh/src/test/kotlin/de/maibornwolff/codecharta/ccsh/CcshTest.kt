package de.maibornwolff.codecharta.ccsh

import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import io.mockk.*
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class CcshTest {

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
            ParserService.executeSelectedParser(any())
        } just Runs
        every {
            ParserService.selectParser(any())
        } returns "someparser"

        Ccsh.main(emptyArray())

        verify { ParserService.executeSelectedParser(any()) }
    }
}
