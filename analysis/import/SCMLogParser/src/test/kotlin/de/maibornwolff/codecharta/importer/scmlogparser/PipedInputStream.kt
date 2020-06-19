package de.maibornwolff.codecharta.importer.scmlogparser

import de.maibornwolff.codecharta.importer.scmlogparser.SCMLogParser.Companion.mainWithInOut
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.PrintStream

class PipedInputStream {
    private val resource = "src/test/resources/example_git_numstat.log"

    private val output = getResultString()

    private fun getResultString(): String {
        val input = File("src/test/resources/cc_project.cc.json").bufferedReader().readLines().joinToString(separator = "\n") { it }
        return executeForOutput(input, arrayOf(resource, "--input-format=GIT_LOG_NUMSTAT"))
    }

    @Test
    fun `json output does contain files from scan`() {
        assertThat(output).contains(
                """"name":"example_svn.log""",
                """"name":"SVNLogParserStrategy.kt"""
        )
    }

    @Test
    fun `json output does contain files from piped project`() {
        assertThat(output).contains(
                """"name":"FooBar.java"""",
                """"coverage":0.0"""
        )
    }

    private fun executeForOutput(input: String, args: Array<String> = emptyArray()) =
            outputAsString(input) { inputStream, outputStream, errorStream ->
                mainWithInOut(inputStream, outputStream, errorStream, args)
            }

    private fun outputAsString(input: String, aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) =
            outputAsString(ByteArrayInputStream(input.toByteArray()), aMethod)

    private fun outputAsString(
        inputStream: InputStream = System.`in`,
        aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit
    ) =
            ByteArrayOutputStream().use { baOutputStream ->
                PrintStream(baOutputStream).use { outputStream ->
                    aMethod(inputStream, outputStream, System.err)
                }
                baOutputStream.toString()
            }
}