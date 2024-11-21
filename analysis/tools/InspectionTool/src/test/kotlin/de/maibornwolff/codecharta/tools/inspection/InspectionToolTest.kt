package de.maibornwolff.codecharta.tools.inspection

import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InspectionToolTest {
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
        errContent.flush()
    }

    @Test
    fun `should read project when provided with input file`() {
        // when
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json"))

        // then
        val expectedOutput = "root" + System.lineSeparator() + "- src" + System.lineSeparator()
        assertThat(cliResult).isEqualTo(expectedOutput)
    }

    @Test
    fun `should read project when receiving piped input`() {
        // given
        val inputFilePath = "src/test/resources/sample_project.cc.json"
        val input =
            File(inputFilePath).bufferedReader().readLines().joinToString(separator = "") {
                it
            }

        // when
        val cliResult = executeForOutput(input)

        // then
        val expectedOutput = "root" + System.lineSeparator() + "- src" + System.lineSeparator()
        assertThat(cliResult).isEqualTo(expectedOutput)
    }

    @Test
    fun `should not produce output when provided with invalid project file`() {
        // given
        System.setErr(PrintStream(errContent))

        // when
        executeForOutput("", arrayOf("src/test/resources/invalid_project.cc.json"))

        // then
        assertThat(errContent.toString()).contains("invalid_project.cc.json is not a valid project")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should return error when given malformed piped input`() {
        // given
        val input = "{this: 12}"
        System.setErr(PrintStream(errContent))

        // when
        executeForOutput(input)

        // then
        assertThat(errContent.toString()).contains("The piped input is not a valid project")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should print structure accordingly`() {
        // when
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json"))

        // then
        val expectedOutput = "root" + System.lineSeparator() + "- src" + System.lineSeparator()
        assertThat(cliResult).contains(expectedOutput)
    }

    @Test
    fun `should print structure accordingly when level is set`() {
        // when
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-l=2"))

        // then
        assertThat(cliResult).contains(listOf("folder3", "- - "))
    }

    @Test
    fun `should stop execution when input file is invalid`() {
        // given
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false
        System.setErr(PrintStream(errContent))

        // when
        CommandLine(InspectionTool()).execute("thisDoesNotExist.cc.json").toString()

        // then
        assertThat(errContent.toString()).contains("Input invalid file for InspectionTool, stopping execution")

        // clean up
        System.setErr(originalErr)
    }
}
