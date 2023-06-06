package de.maibornwolff.codecharta.rawtextparser

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser.Companion.mainWithInOut
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.OutputStreamWriter
import java.io.PrintStream

class RawTextParserTest {

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
        val emptyInput = ""

        val emptyFolder = File(emptyFolderPath)
        emptyFolder.mkdir()
        emptyFolder.deleteOnExit()

        val isEmptyPathApplicable = RawTextParser().isApplicable(emptyFolderPath)
        val isNonExistentPathApplicable = RawTextParser().isApplicable(nonExistentPath)
        val isEmptyInputApplicable = RawTextParser().isApplicable(emptyInput)

        Assertions.assertThat(isEmptyPathApplicable).isFalse()
        Assertions.assertThat(isNonExistentPathApplicable).isFalse()
        Assertions.assertThat(isEmptyInputApplicable).isFalse()
    }
}
