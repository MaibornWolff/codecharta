package de.maibornwolff.codecharta.rawtextparser

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser.Companion.mainWithInOut
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.* // ktlint-disable

class RawTextParserTest {
    @Test
    fun `should be able to process single file`() {
        val result = ByteArrayOutputStream()
        val expectedResultFile = File("src/test/resources/cc_projects/project_3.cc.json").absoluteFile

        RawTextParser.mainWithOutputStream(PrintStream(result), arrayOf("src/test/resources/sampleproject/tabs.xyz"))
        val resultJSON = JsonParser().parse(result.toString())
        val expectedJson = JsonParser().parse(expectedResultFile.reader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }

    @Test
    fun `should process project and pass on parameters`() {
        val result = ByteArrayOutputStream()
        val expectedResultFile = File("src/test/resources/cc_projects/project_4.cc.json").absoluteFile

        RawTextParser.mainWithOutputStream(
            PrintStream(result),
            arrayOf(
                "src/test/resources/sampleproject/",
                "-p=foo",
                "--tabWidth=2",
                "--maxIndentationLevel=2",
                "-e=tabs*."
            )
        )
        val resultJSON = JsonParser().parse(result.toString())
        val expectedJson = JsonParser().parse(expectedResultFile.reader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }

    @Test
    fun `should merge with piped project`() {
        val pipedProject = "src/test/resources/cc_projects/project_4.cc.json"
        val partialResult = "src/test/resources/cc_projects/project_3.cc.json"
        val fileToParse = "src/test/resources/sampleproject/tabs.xyz"
        val input = File(pipedProject).bufferedReader().readLines().joinToString(separator = "\n") { it }
        val partialProject1 = ProjectDeserializer.deserializeProject(File(partialResult).inputStream())!!
        val partialProject2 = ProjectDeserializer.deserializeProject(File(pipedProject).inputStream())!!
        val expected = ByteArrayOutputStream()
        ProjectSerializer.serializeProject(
            MergeFilter.mergePipedWithCurrentProject(partialProject2, partialProject1),
            OutputStreamWriter(PrintStream(expected))
        )
        val result = executeForOutput(input, arrayOf(fileToParse, "-p="))
        val resultJSON = JsonParser().parse(result)
        Assertions.assertThat(resultJSON).isEqualTo(JsonParser().parse(expected.toString()))
    }
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