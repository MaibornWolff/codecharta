package de.maibornwolff.codecharta.analysers.parsers.unified

import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
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
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should produce correct output when given a project folder`() {
        // given
        val pipedProject = ""
        val inputFilePath = "src/test/resources/sampleproject"
        val expectedResultFile = File("src/test/resources/sampleFolder.cc.json").absoluteFile

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should correctly merge when piped into another project`() {
        // given
        val pipedProject = File("src/test/resources/projectToPipe.cc.json").readText()
        val inputFilePath = "src/test/resources/sampleproject"
        val expectedResultFile = File("src/test/resources/mergeResult.cc.json").absoluteFile

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    // tests about correctly stopping in error case

    @Test
    fun `should stop execution and throw error when input file could not be found`() {
        // given
        val pipedProject = ""
        val inputFilePath = "src/test/resources/file.invalid"
        System.setErr(PrintStream(errContent))

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        Assertions.assertThat(result).isEmpty()
        Assertions.assertThat(errContent.toString()).contains("Could not find resource `$inputFilePath`!")
        Assertions.assertThat(errContent.toString()).contains("Input invalid file for UnifiedParser, stopping execution...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should stop execution and throw error when no parsable files were found in project`() {
        // given
        val pipedProject = ""
        val inputFilePath = "src/test/resources/sampleproject"
        System.setErr(PrintStream(errContent))

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--file-extensions=.invalid"))

        // then
        Assertions.assertThat(result).isEmpty()
        Assertions.assertThat(errContent.toString())
            .contains("No files with specified file extension(s) were found within the given folder - not generating an output file!")

        // clean up
        System.setErr(originalErr)
    }

    // TODO: add more tests/error messages when included/excluded extensions did not behave as planned (e.g. none were found)
}
