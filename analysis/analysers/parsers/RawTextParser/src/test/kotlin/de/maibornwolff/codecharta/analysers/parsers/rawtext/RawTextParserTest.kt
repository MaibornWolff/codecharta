package de.maibornwolff.codecharta.analysers.parsers.rawtext

import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.OutputStreamWriter
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class RawTextParserTest {
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private fun provideValidInputFiles(): List<Arguments> {
        return listOf(
            Arguments.of("src/test/resources/sampleproject"),
            Arguments.of("src/test/resources/sampleproject/tabs.included")
        )
    }

    private fun executeForOutput(input: String, args: Array<String>): String {
        val inputStream = ByteArrayInputStream(input.toByteArray())
        val outputStream = ByteArrayOutputStream()
        val printStream = PrintStream(outputStream)
        val errorStream = System.err
        val configuredParser = RawTextParser(inputStream, printStream, errorStream)
        CommandLine(configuredParser).execute(*args)
        return outputStream.toString()
    }

    @Test
    fun `Should produce correct output when given single file`() {
        // given
        val pipedProject = ""
        val inputFilePath = "src/test/resources/sampleproject/tabs.included"
        val expectedResultFile = File("src/test/resources/cc_projects/project_3.cc.json")

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should produce correct output when given a folder and specific parameters`() {
        // given
        val pipedProject = ""
        val inputFilePath = "src/test/resources/sampleproject/"
        val expectedResultFile = File("src/test/resources/cc_projects/project_4.cc.json").absoluteFile

        // when
        val result =
            executeForOutput(
                pipedProject,
                arrayOf(inputFilePath, "--tab-width=2", "--max-indentation-level=2", "-e=tabs*.")
            )

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should correctly merge when piped into another project`() {
        // given
        val pipedProject = "src/test/resources/cc_projects/project_4.cc.json"
        val partialResult = "src/test/resources/cc_projects/project_3.cc.json"
        val fileToParse = "src/test/resources/sampleproject/tabs.included"
        val input = File(pipedProject).bufferedReader().readLines().joinToString(separator = "\n") { it }
        val partialProject1 = ProjectDeserializer.deserializeProject(File(partialResult).inputStream())
        val partialProject2 = ProjectDeserializer.deserializeProject(File(pipedProject).inputStream())
        val expected = ByteArrayOutputStream()

        // when
        ProjectSerializer.serializeProject(
            MergeFilter.mergePipedWithCurrentProject(partialProject2, partialProject1),
            OutputStreamWriter(PrintStream(expected))
        )
        val result = executeForOutput(input, arrayOf(fileToParse))

        // then
        JSONAssert.assertEquals(result, expected.toString(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @ParameterizedTest
    @MethodSource("provideValidInputFiles")
    fun `Should be identified as applicable when given directory path contains a source code file`(resourceToBeParsed: String) {
        // when
        val isUsable = RawTextParser().isApplicable(resourceToBeParsed)
        // then
        Assertions.assertThat(isUsable).isTrue()
    }

    @Test
    fun `Should be identified as applicable when given path is a file`() {
        // when
        val isUsable = RawTextParser().isApplicable("src/test/resources/sampleproject/tabs.included")
        // then
        Assertions.assertThat(isUsable).isTrue()
    }

    @Test
    fun `Should NOT be identified as applicable when given directory does not contain any source code file `() {
        // given
        val emptyFolderPath = "src/test/resources/empty"
        val nonExistentPath = "src/test/resources/this/does/not/exist"
        // Empty String is invalid because File("") generates an empty abstract pathname which does not physically exist
        val emptyString = ""
        val emptyFolder = File(emptyFolderPath)
        emptyFolder.mkdir()
        emptyFolder.deleteOnExit()

        // when
        val isEmptyPathApplicable = RawTextParser().isApplicable(emptyFolderPath)
        val isNonExistentPathApplicable = RawTextParser().isApplicable(nonExistentPath)
        val isEmptyStringApplicable = RawTextParser().isApplicable(emptyString)

        // then
        Assertions.assertThat(isEmptyPathApplicable).isFalse()
        Assertions.assertThat(isNonExistentPathApplicable).isFalse()
        Assertions.assertThat(isEmptyStringApplicable).isFalse()
    }

    @Test
    fun `Should stop execution when input files are invalid`() {
        // given
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false
        System.setErr(PrintStream(errContent))

        // when
        CommandLine(RawTextParser()).execute("thisDoesNotExist.cc.json").toString()

        // then
        Assertions.assertThat(errContent.toString())
            .contains("Input invalid file for RawTextParser, stopping execution")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `Should not produce an output and notify the user when the only specified extension was not found in the folder`() {
        // given
        val lambdaSlot = mutableListOf<() -> String>()
        mockkObject(Logger)
        every { Logger.error(capture(lambdaSlot)) } returns Unit

        // when
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/", "--file-extensions=invalid"))

        // then
        Assertions.assertThat(result).isEmpty()
        Assertions.assertThat(
            lambdaSlot.any {
                    e ->
                e().contains(
                    "No files with specified file extension(s) were found within the given folder - not generating an output file!"
                )
            }
        ).isTrue()
    }

    @Test
    fun `Should warn the user when one of the specified extensions was not found in the folder`() {
        // given
        val lambdaSlot = mutableListOf<() -> String>()
        mockkObject(Logger)
        every { Logger.warn(capture(lambdaSlot)) } returns Unit

        // when
        val result =
            executeForOutput("", arrayOf("src/test/resources/sampleproject", "--file-extensions=invalid, included"))

        // then
        Assertions.assertThat(result).isNotEmpty()
        Assertions.assertThat(
            lambdaSlot.any {
                    e ->
                e().contains("The specified file extension 'invalid' was not found within the given folder!")
            }
        ).isTrue()
        Assertions.assertThat(
            lambdaSlot.any {
                    e ->
                e().contains("The specified file extension 'included' was not found within the given folder!")
            }
        ).isFalse()
    }

    @Test
    fun `Should not produce an output and notify the user when none of the specified extensions were found in the folder`() {
        // given

        val lambdaSlot = mutableListOf<() -> String>()
        mockkObject(Logger)
        every { Logger.error(capture(lambdaSlot)) } returns Unit

        // when
        val result =
            executeForOutput(
                "",
                arrayOf("src/test/resources/sampleproject/", "--file-extensions=invalid1, invalid2, also_invalid")
            )

        // then
        Assertions.assertThat(result).isEmpty()
        Assertions.assertThat(
            lambdaSlot.any {
                    e ->
                e().contains(
                    "No files with specified file extension(s) were found within the given folder - not generating an output file!"
                )
            }
        ).isTrue()
    }

    @Test
    fun `Should include all metrics when metrics-flag is empty string (default in interactive mode)`() {
        // given
        val expectedResultFile = File("src/test/resources/cc_projects/project_3.cc.json").absoluteFile

        // when
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/tabs.included", "--metrics="))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should include all files when exclude-regex-flag is empty string (default in interactive mode)`() {
        // given
        val expectedResultFile = File("src/test/resources/cc_projects/project_5.cc.json").absoluteFile

        // when
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/", "--exclude="))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should include all files when file-extensions-flag is empty string (default in interactive mode)`() {
        // given
        val expectedResultFile = File("src/test/resources/cc_projects/project_5.cc.json").absoluteFile

        // when
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/", "--file-extensions="))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should produce warning logs when given invalid metrics`() {
        // given
        val inputFilePath = "src/test/resources/sampleproject"
        val validMetricName = "IndentationLevel"
        val invalidMetricName = "invalidMetric"

        val lambdaSlot = mutableListOf<() -> String>()
        mockkObject(Logger)
        every { Logger.warn(capture(lambdaSlot)) } returns Unit

        // when
        executeForOutput("", arrayOf(inputFilePath, "--metrics=$validMetricName, $invalidMetricName"))

        // then
        Assertions.assertThat(lambdaSlot.any { e -> e().contains(invalidMetricName) }).isTrue()
    }
}
