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

    companion object {
        private const val TEST_RESOURCE_BASE_FOLDER = "src/test/resources/"

        @JvmStatic
        fun provideValidInputFiles(): List<Arguments> {
            return listOf(
                Arguments.of("${TEST_RESOURCE_BASE_FOLDER}sampleproject"),
                Arguments.of("${TEST_RESOURCE_BASE_FOLDER}sampleproject/tabs.included")
            )
        }
    }

    @AfterEach
    fun afterTest() {
        unmockkAll()
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
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}sampleproject/tabs.included"
        val expectedResultFile = File("${TEST_RESOURCE_BASE_FOLDER}cc_projects/project_3.cc.json")

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should produce correct output when given a folder and specific parameters`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}sampleproject/"
        val expectedResultFile = File("${TEST_RESOURCE_BASE_FOLDER}cc_projects/project_4.cc.json").absoluteFile

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
        val pipedProject = "${TEST_RESOURCE_BASE_FOLDER}cc_projects/project_4.cc.json"
        val partialResult = "${TEST_RESOURCE_BASE_FOLDER}cc_projects/project_3.cc.json"
        val fileToParse = "${TEST_RESOURCE_BASE_FOLDER}sampleproject/tabs.included"
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
        val isUsable = RawTextParser().isApplicable("${TEST_RESOURCE_BASE_FOLDER}sampleproject/tabs.included")
        // then
        Assertions.assertThat(isUsable).isTrue()
    }

    @Test
    fun `Should NOT be identified as applicable when given directory does not contain any source code file `() {
        // given
        val emptyFolderPath = "${TEST_RESOURCE_BASE_FOLDER}empty"
        val nonExistentPath = "${TEST_RESOURCE_BASE_FOLDER}this/does/not/exist"
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
        val result = executeForOutput("", arrayOf("${TEST_RESOURCE_BASE_FOLDER}sampleproject/", "--file-extensions=invalid"))

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
            executeForOutput("", arrayOf("${TEST_RESOURCE_BASE_FOLDER}sampleproject", "--file-extensions=invalid, included"))

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
                arrayOf("${TEST_RESOURCE_BASE_FOLDER}sampleproject/", "--file-extensions=invalid1, invalid2, also_invalid")
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
        val expectedResultFile = File("${TEST_RESOURCE_BASE_FOLDER}cc_projects/project_3.cc.json").absoluteFile

        // when
        val result = executeForOutput("", arrayOf("${TEST_RESOURCE_BASE_FOLDER}sampleproject/tabs.included", "--metrics="))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should include all files when exclude-regex-flag is empty string (default in interactive mode)`() {
        // given
        val expectedResultFile = File("${TEST_RESOURCE_BASE_FOLDER}cc_projects/project_5.cc.json").absoluteFile

        // when
        val result = executeForOutput("", arrayOf("${TEST_RESOURCE_BASE_FOLDER}sampleproject/", "--exclude="))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should include all files when file-extensions-flag is empty string (default in interactive mode)`() {
        // given
        val expectedResultFile = File("${TEST_RESOURCE_BASE_FOLDER}cc_projects/project_5.cc.json").absoluteFile

        // when
        val result = executeForOutput("", arrayOf("${TEST_RESOURCE_BASE_FOLDER}sampleproject/", "--file-extensions="))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should produce warning logs when given invalid metrics`() {
        // given
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}sampleproject"
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

    @Test
    fun `should reuse metrics from base file when checksums match`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}sampleproject"
        val baseFilePath = "${TEST_RESOURCE_BASE_FOLDER}cc_projects/project_5.cc.json"
        val expectedResultFile = File("${TEST_RESOURCE_BASE_FOLDER}cc_projects/project_5.cc.json").absoluteFile
        System.setErr(PrintStream(errContent))

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--base-file=$baseFilePath"))

        // then
        Assertions.assertThat(errContent.toString()).contains("Loaded 5 file nodes from base file for checksum comparison")
        Assertions.assertThat(errContent.toString()).contains("Checksum comparison: 5 files skipped, 0 files analyzed (100% reused)")
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should show warning when base file does not exist`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}sampleproject"
        val baseFilePath = "${TEST_RESOURCE_BASE_FOLDER}cc_projects/nonexistent.cc.json"
        System.setErr(PrintStream(errContent))

        // when
        executeForOutput(pipedProject, arrayOf(inputFilePath, "--base-file=$baseFilePath"))

        // then
        Assertions.assertThat(errContent.toString()).contains("Base file")
        Assertions.assertThat(errContent.toString()).contains("does not exist, continuing with normal analysis...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should exclude files based on gitignore by default`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}gitignore-test-project"
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // Assert
        Assertions.assertThat(result).contains("Main.kt")
        Assertions.assertThat(result).contains("NotIgnored.kt")
        Assertions.assertThat(result).doesNotContain("ignored.exclude")
        Assertions.assertThat(result).doesNotContain("output.txt")
        Assertions.assertThat(errContent.toString()).contains("files were excluded by .gitignore rules")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should include gitignore-excluded files when bypass-gitignore flag is set`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}gitignore-test-project"
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--bypass-gitignore"))

        // Assert
        Assertions.assertThat(result).contains("Main.kt")
        Assertions.assertThat(result).contains("NotIgnored.kt")
        Assertions.assertThat(result).contains("ignored.exclude")
        Assertions.assertThat(result).contains("output.txt")
        Assertions.assertThat(errContent.toString()).doesNotContain("files were excluded by .gitignore rules")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should apply both gitignore and regex exclusions`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}gitignore-test-project"
        val excludePattern = "Main.kt"
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "-e=$excludePattern"))

        // Assert
        Assertions.assertThat(result).doesNotContain("ignored.exclude")
        Assertions.assertThat(result).doesNotContain("build")
        Assertions.assertThat(result).doesNotContain("Main.kt")
        Assertions.assertThat(result).contains("NotIgnored.kt")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should warn when no gitignore file exists at root level`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}sampleproject"
        System.setErr(PrintStream(errContent))

        // Act
        executeForOutput(pipedProject, arrayOf(inputFilePath))

        // Assert
        Assertions.assertThat(
            errContent.toString()
        ).contains("No .gitignore found at root level, excluding common build folders as fallback...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should report gitignore statistics in verbose mode`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${TEST_RESOURCE_BASE_FOLDER}gitignore-test-project"
        System.setErr(PrintStream(errContent))

        // Act
        executeForOutput(pipedProject, arrayOf(inputFilePath, "--verbose"))

        // Assert
        Assertions.assertThat(errContent.toString()).contains("files were excluded by .gitignore rules")
        Assertions.assertThat(errContent.toString()).contains("Found .gitignore files at:")
        Assertions.assertThat(errContent.toString()).contains("- .gitignore")

        // clean up
        System.setErr(originalErr)
    }
}
