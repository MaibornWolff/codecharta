package de.maibornwolff.codecharta.analysers.parsers.unified

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.typescript.TypescriptQueries
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class UnifiedParserTest {
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private fun executeForOutput(input: String, args: Array<String>): String {
        val inputStream = ByteArrayInputStream(input.toByteArray())
        val outputStream = ByteArrayOutputStream()
        val printStream = PrintStream(outputStream)
        val errorStream = System.err
        val configuredParser = UnifiedParser(inputStream, printStream, errorStream)
        CommandLine(configuredParser).execute(*args)
        return outputStream.toString()
    }

    @Test
    fun `Should produce correct output when given single file`() {
        // given
        val pipedProject = ""
        val inputFilePath = "src/test/resources/typescriptSample.ts"
        val expectedResultFile = File("src/test/resources/typescriptSample.cc.json")

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        assertThat(result).isEqualTo(expectedResultFile)
    }

    @Test
    fun `temp test`() {
        val inputFilePath = "src/"

        val tmp = TypescriptQueries.complexityQuery

        val result = executeForOutput("", arrayOf(inputFilePath))

        println(result)
        assertThat(false)
    }
}
