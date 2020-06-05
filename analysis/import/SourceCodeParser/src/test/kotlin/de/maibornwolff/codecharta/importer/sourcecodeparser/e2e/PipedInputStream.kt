package de.maibornwolff.codecharta.importer.sourcecodeparser.e2e

import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain.Companion.mainWithInOut
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.*

class PipedInputStream {
    private val resource = "src/test/resources/sampleproject"
    private val output = getResultString()
    private fun getResultString(): String {
        val input = File("src/test/resources/cc_project.cc.json").bufferedReader().readLines()
            .joinToString(separator = "\n") { it }
        return executeForOutput(input, arrayOf(resource, "--format=json"))
    }

    @Test
    fun `json output does contain files from scan`() {
        assertThat(output).contains(
            """"name":"foo.java""",
            """"name":"hello.java"""
        )
    }

    @Test
    fun `json output does contain files from piped project`() {
        assertThat(output).contains(
            """"name":"FooBar.java"""",
            """"coverage":0.0"""
        )
    }

    @Test
    fun `node attributes of piped input and result nodes are merged`() {
        assertThat(output).contains(
            """"myMetric":42.0""",
            """"rloc":31"""
        )
    }

    private fun executeForOutput(input: String, args: Array<String> = emptyArray()) =
        outputAsString(input) { inputStream, outputStream, errorStream ->
            mainWithInOut(outputStream, inputStream, errorStream, args)
        }

    private fun outputAsString(
        input: String,
        aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit
    ) =
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