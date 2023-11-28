package de.maibornwolff.codecharta.rawtextparser

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser.Companion.mainWithInOut
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.slot
import io.mockk.unmockkAll
import io.mockk.verify
import mu.KLogger
import mu.KotlinLogging
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
                    Arguments.of("src/test/resources/sampleproject/tabs.included"))
        }
    }

    private fun executeForOutput(input: String, args: Array<String> = emptyArray()) =
            outputAsString(input) { inputStream, outputStream, errorStream ->
                mainWithInOut(outputStream, inputStream, errorStream, args)
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

    @Test
    fun `should produce correct output when given single file`() {
        // given
        val expectedResultFile = File("src/test/resources/cc_projects/project_3.cc.json").absoluteFile

        // when
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/tabs.included"))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `should produce correct output when given a folder and specific parameters`() {
        // given
        val expectedResultFile = File("src/test/resources/cc_projects/project_4.cc.json").absoluteFile

        // when
        val result = executeForOutput(
            "",
            arrayOf("src/test/resources/sampleproject/", "--tab-width=2", "--max-indentation-level=2", "-e=tabs*.")
        )

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `should correctly merge when piped into another project`() {
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
    fun `should be identified as applicable when given directory path contains a source code file`(resourceToBeParsed: String) {
        // when
        val isUsable = RawTextParser().isApplicable(resourceToBeParsed)
        // then
        Assertions.assertThat(isUsable).isTrue()
    }

    @Test
    fun `should be identified as applicable when given path is a file`() {
        // when
        val isUsable = RawTextParser().isApplicable("src/test/resources/sampleproject/tabs.included")
        // then
        Assertions.assertThat(isUsable).isTrue()
    }

    @Test
    fun `should NOT be identified as applicable when given directory does not contain any source code file `() {
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
    fun `should stop execution when input files are invalid`() {
        // given
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false
        System.setErr(PrintStream(errContent))

        // when
        CommandLine(RawTextParser()).execute("thisDoesNotExist.cc.json").toString()

        // then
        Assertions.assertThat(errContent.toString()).contains("Input invalid file for RawTextParser, stopping execution")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `Should not produce an output and notify the user when the only specified extension was not found in the folder`() {
        // given
        mockkObject(KotlinLogging)
        val loggerMock = mockk<KLogger>()
        val lambdaSlot = slot<(() -> Unit)>()
        val messagesLogged = mutableListOf<String>()
        every { KotlinLogging.logger(capture(lambdaSlot)) } returns loggerMock
        every { loggerMock.error(capture(messagesLogged)) } returns Unit

        // when
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/", "--file-extensions=invalid"))

        // then
        Assertions.assertThat(result).isEmpty()
        Assertions.assertThat(messagesLogged).contains("No files with specified file extension(s) were found within the given folder - not generating an output file!")
        verify { loggerMock.error(any<String>()) }
    }

    @Test
    fun `Should warn the user when one of the specified extensions was not found in the folder`() {
        // given
        mockkObject(KotlinLogging)
        val loggerMock = mockk<KLogger>()
        val lambdaSlot = slot<(() -> Unit)>()
        val messagesLogged = mutableListOf<String>()
        every { KotlinLogging.logger(capture(lambdaSlot)) } returns loggerMock
        every { loggerMock.warn(capture(messagesLogged)) } returns Unit

        // when
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject", "--file-extensions=invalid, included"))

        // then
        Assertions.assertThat(result).isNotEmpty()
        Assertions.assertThat(messagesLogged).contains("The specified file extension 'invalid' was not found within the given folder!")
        Assertions.assertThat(messagesLogged).doesNotContain("The specified file extension 'included' was not found within the given folder!")
    }

    @Test
    fun `Should not produce an output and notify the user when none of the specified extensions were found in the folder`() {
        // given
        mockkObject(KotlinLogging)
        val loggerMock = mockk<KLogger>()
        val lambdaSlot = slot<(() -> Unit)>()
        val messagesLogged = mutableListOf<String>()
        every { KotlinLogging.logger(capture(lambdaSlot)) } returns loggerMock
        every { loggerMock.error(capture(messagesLogged)) } returns Unit

        // when
        val result = executeForOutput("", arrayOf("src/test/resources/sampleproject/", "--file-extensions=invalid1, invalid2, also_invalid"))

        // then
        Assertions.assertThat(result).isEmpty()
        Assertions.assertThat(messagesLogged).contains("No files with specified file extension(s) were found within the given folder - not generating an output file!")
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
}
