package de.maibornwolff.codecharta.ccsh

import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class CcshTest {

    @Test
    fun `parameters should be converted to kebab-case`() {
        val outStream = ByteArrayOutputStream()
        val originalOut = System.out
        System.setOut(PrintStream(outStream))

        Ccsh.main(arrayOf("someparser", ".", "--defaultExcludesS=AbC"))

        Assertions.assertThat(outStream.toString()).contains("--default-excludes-s=AbC")
        System.setOut(originalOut)
    }
}