package de.maibornwolff.codecharta.rawtextparser

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser.Companion.mainWithInOut
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.*
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.OutputStreamWriter
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class RawTextParserTest {
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }
    companion object {
        @JvmStatic
        fun provideValidInputFiles(): List<Arguments> {
            return listOf(
                    Arguments.of("src/test/resources/sampleproject"),
                    Arguments.of("src/test/resources/sampleproject/tabs.xyz"))
        }
    }

    @Test
    fun `should be able to process single file`() {
        val expectedResultFile = File("src/test/resources/cc_projects/project_3.cc.json").absoluteFile

        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/tabs.xyz"))

        val resultJSON = JsonParser.parseString(result)
        val expectedJson = JsonParser.parseReader(expectedResultFile.reader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }

    @Test
    fun `should process project and pass on parameters`() {
        val expectedResultFile = File("src/test/resources/cc_projects/project_4.cc.json").absoluteFile

        val result = executeForOutput(
            "",
            arrayOf("src/test/resources/sampleproject/", "--tab-width=2", "--max-indentation-level=2", "-e=tabs*.")
        )

        val resultJSON = JsonParser.parseString(result)
        val expectedJson = JsonParser.parseReader(expectedResultFile.reader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }

    @Test
    fun `should merge with piped project`() {
        val pipedProject = "src/test/resources/cc_projects/project_4.cc.json"
        val partialResult = "src/test/resources/cc_projects/project_3.cc.json"
        val fileToParse = "src/test/resources/sampleproject/tabs.xyz"
        val input = File(pipedProject).bufferedReader().readLines().joinToString(separator = "\n") { it }
        val partialProject1 = ProjectDeserializer.deserializeProject(File(partialResult).inputStream())
        val partialProject2 = ProjectDeserializer.deserializeProject(File(pipedProject).inputStream())
        val expected = ByteArrayOutputStream()
        ProjectSerializer.serializeProject(
            MergeFilter.mergePipedWithCurrentProject(partialProject2, partialProject1),
            OutputStreamWriter(PrintStream(expected))
        )

        val result = executeForOutput(input, arrayOf(fileToParse))

        val resultJSON = JsonParser.parseString(result)
        Assertions.assertThat(resultJSON).isEqualTo(JsonParser.parseString(expected.toString()))
    }

    fun executeForOutput(input: String, args: Array<String> = emptyArray()) =
        outputAsString(input) { inputStream, outputStream, errorStream ->
            mainWithInOut(outputStream, inputStream, errorStream, args)
        }

    fun outputAsString(input: String, aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) =
        outputAsString(ByteArrayInputStream(input.toByteArray()), aMethod)

    fun outputAsString(
        inputStream: InputStream = System.`in`,
        aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit
    ) =
        ByteArrayOutputStream().use { baOutputStream ->
            PrintStream(baOutputStream).use { outputStream ->
                aMethod(inputStream, outputStream, System.err)
            }
            baOutputStream.toString()
        }

    @ParameterizedTest
    @MethodSource("provideValidInputFiles")
    fun `should be identified as applicable for given directory path containing a source code file`(resourceToBeParsed: String) {
        val isUsable = RawTextParser().isApplicable(resourceToBeParsed)
        Assertions.assertThat(isUsable).isTrue()
    }

    @Test
    fun `should be identified as applicable for given path being a file`() {
        val isUsable = RawTextParser().isApplicable("src/test/resources/sampleproject/tabs.xyz")
        Assertions.assertThat(isUsable).isTrue()
    }

    @Test
    fun `should NOT be identified as applicable if given directory does not contain any source code file `() {
        val emptyFolderPath = "src/test/resources/empty"
        val nonExistentPath = "src/test/resources/this/does/not/exist"
        // Empty String is invalid because File("") generates an empty abstract pathname which does not physically exist
        val emptyString = ""

        val emptyFolder = File(emptyFolderPath)
        emptyFolder.mkdir()
        emptyFolder.deleteOnExit()

        val isEmptyPathApplicable = RawTextParser().isApplicable(emptyFolderPath)
        val isNonExistentPathApplicable = RawTextParser().isApplicable(nonExistentPath)
        val isEmptyStringApplicable = RawTextParser().isApplicable(emptyString)

        Assertions.assertThat(isEmptyPathApplicable).isFalse()
        Assertions.assertThat(isNonExistentPathApplicable).isFalse()
        Assertions.assertThat(isEmptyStringApplicable).isFalse()
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(RawTextParser()).execute("thisDoesNotExist.cc.json").toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Input invalid file for RawTextParser, stopping execution")
    }

    @Test
    fun `Should not produce an output and notify the user if the only specified extension was not found in the folder`() {
        System.setErr(PrintStream(errContent))
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/", "--file-extensions=invalid"))
        System.setErr(originalErr)

        Assertions.assertThat(result == "")
        Assertions.assertThat(errContent.toString()).contains("ERROR: No files with specified file extension(s) were found within the given folder - not generating an output file!")
    }

    @Test
    fun `Should warn the user if one of the specified extensions was not found in the folder`() {
        System.setErr(PrintStream(errContent))
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/tabs.xyz", "--file-extensions=xyz, invalid"))
        System.setErr(originalErr)

        Assertions.assertThat(result != "").isTrue()
        Assertions.assertThat(errContent.toString()).contains("WARNING: The specified file extension 'invalid' was not found within the given folder!")
        Assertions.assertThat(errContent.toString()).doesNotContain("WARNING: The specified file extension 'xyz' was not found within the given folder!")

    }

    @Test
    fun `Should not produce an output and notify the user if none of the specified extensions were found in the folder`() {
        System.setErr(PrintStream(errContent))
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/", "--file-extensions=invalid1, invalid2, also_invalid"))
        System.setErr(originalErr)

        Assertions.assertThat(result == "")
        Assertions.assertThat(errContent.toString()).contains("ERROR: No files with specified file extension(s) were found within the given folder - not generating an output file!")
    }
}
