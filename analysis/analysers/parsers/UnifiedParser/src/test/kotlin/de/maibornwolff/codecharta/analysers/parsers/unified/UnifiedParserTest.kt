package de.maibornwolff.codecharta.analysers.parsers.unified

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
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class UnifiedParserTest {
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err
    private val testResourceBaseFolder = "src/test/resources/"

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

    private fun provideSupportedLanguages() = listOf(
        Arguments.of("typescript", ".ts"),
        Arguments.of("javascript", ".js"),
        Arguments.of("java", ".java"),
        Arguments.of("cSharp", ".cs")
    )

    @ParameterizedTest
    @MethodSource("provideSupportedLanguages")
    fun `Should produce correct output for a single source file of each supported language`(language: String, fileExtension: String) {
        // given
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}${language}Sample$fileExtension"
        val expectedResultFile = File("${testResourceBaseFolder}${language}Sample.cc.json")

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should produce correct output when given a project folder`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}sampleProject.cc.json").absoluteFile

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should correctly merge when piped into another project`() {
        // given
        val pipedProject = File("${testResourceBaseFolder}projectToPipe.cc.json").readText()
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}mergeResult.cc.json").absoluteFile

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `should stop execution and throw error when input file could not be found`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}file.invalid"
        System.setErr(PrintStream(errContent))

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // then
        Assertions.assertThat(result).isEmpty()
        Assertions.assertThat(errContent.toString()).contains("Could not find resource `${File(inputFilePath)}`!")
        Assertions.assertThat(errContent.toString()).contains("Input invalid file for UnifiedParser, stopping execution...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should stop execution and throw error when no parsable files were found in project`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
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

    @Test
    fun `should display message for each file when verbose mode was set`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val ignoredFiles = listOf(
            ".whatever/something.kt",
            "bar/something.strange",
            "foo.py"
        )
        val parsedFiles = listOf(
            "bar/hello.kt",
            "bar/foo.kt",
            "foo.kt",
            "whenCase.kt",
            "helloWorld.ts"
        )
        System.setErr(PrintStream(errContent))

        // when
        executeForOutput(pipedProject, arrayOf(inputFilePath, "--verbose"))

        // then
        for (file in ignoredFiles) {
            Assertions.assertThat(errContent.toString()).contains("Ignoring file $file")
        }
        for (file in parsedFiles) {
            Assertions.assertThat(errContent.toString()).contains("Calculating metrics for file $file")
        }

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should only include file extensions that we specified when file-extensions flag is set`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}kotlinOnly.cc.json").absoluteFile

        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--file-extensions=.kt"))

        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `should display warning when a file extension specified to be included was not found in project`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}kotlinOnly.cc.json").absoluteFile
        val invalidFileExtension = ".invalid"
        System.setErr(PrintStream(errContent))

        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--file-extensions=.kt, $invalidFileExtension"))

        Assertions.assertThat(errContent.toString())
            .contains("From the specified file extensions to parse, [$invalidFileExtension] were not found in the given input!")
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should include normally excluded folders when without-default-excludes flag is set`() {
        // given
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}includeAll.cc.json").absoluteFile

        // when
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--without-default-excludes"))

        // then
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }
}
