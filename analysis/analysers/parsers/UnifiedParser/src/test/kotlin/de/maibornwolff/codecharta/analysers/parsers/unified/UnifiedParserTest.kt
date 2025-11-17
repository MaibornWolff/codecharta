package de.maibornwolff.codecharta.analysers.parsers.unified

import io.mockk.every
import io.mockk.spyk
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
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

    companion object {
        @JvmStatic
        fun provideSupportedLanguages() = listOf(
            Arguments.of("bash", ".sh"),
            Arguments.of("cHeader", ".h"),
            Arguments.of("cppHeader", ".hpp"),
            Arguments.of("cpp", ".cpp"),
            Arguments.of("c", ".c"),
            Arguments.of("cSharp", ".cs"),
            Arguments.of("go", ".go"),
            Arguments.of("java", ".java"),
            Arguments.of("javascript", ".js"),
            Arguments.of("kotlin", ".kt"),
            Arguments.of("objectiveC", ".m"),
            Arguments.of("php", ".php"),
            Arguments.of("python", ".py"),
            Arguments.of("ruby", ".rb"),
            Arguments.of("swift", ".swift"),
            Arguments.of("typescript", ".ts")
        )
    }

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private fun createMockedUnifiedParser(parser: UnifiedParser, input: String): UnifiedParser {
        val spyParser = spyk(parser)

        every { spyParser.shouldProcessPipedInput(any()) } answers {
            val files = firstArg<List<File>>()
            files.any { it.toString() == "-" } || input.isNotEmpty()
        }

        return spyParser
    }

    private fun executeForOutput(input: String, args: Array<String>): String {
        val inputStream = ByteArrayInputStream(input.toByteArray())
        val outputStream = ByteArrayOutputStream()
        val printStream = PrintStream(outputStream)
        val errorStream = System.err

        val configuredParser = UnifiedParser(inputStream, printStream, errorStream)
        val mockedParser = createMockedUnifiedParser(configuredParser, input)
        CommandLine(mockedParser).execute(*args)

        return outputStream.toString()
    }

    @ParameterizedTest
    @MethodSource("provideSupportedLanguages")
    fun `Should produce correct output for a single source file of each supported language`(language: String, fileExtension: String) {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}languageSamples/${language}Sample$fileExtension"
        val expectedResultFile = File("${testResourceBaseFolder}languageSamples/${language}Sample.cc.json")

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // Assert
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should produce correct output when given a project folder`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}sampleProject.cc.json").absoluteFile

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // Assert
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `Should correctly merge and show warnings for mismatched attribute descriptors when piped into another project`() {
        // Arrange
        val pipedProject = File("${testResourceBaseFolder}projectToPipe.cc.json").readText()
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}mergeResult.cc.json").absoluteFile
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // Assert
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
        assertThat(errContent.toString()).contains("6 nodes were processed, 5 were added and 1 were merged")
        assertThat(
            errContent.toString()
        ).contains("Description of 'complexity' metric differs between files! Using value of first file...")
        assertThat(
            errContent.toString()
        ).contains("Link of 'complexity' metric differs between files! Using value of first file...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should stop execution and throw error when input file could not be found`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}file.invalid"
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // Assert
        assertThat(result).isEmpty()
        assertThat(errContent.toString()).contains("Could not find resource `${File(inputFilePath)}`!")
        assertThat(errContent.toString()).contains("Input invalid file for UnifiedParser, stopping execution...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should display message for each file when verbose mode was set`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val parsedFiles = listOf(
            "bar/hello.kt",
            "bar/foo.kt",
            "foo.kt",
            "foo.py",
            "whenCase.kt",
            "helloWorld.ts"
        )
        System.setErr(PrintStream(errContent))

        // Act
        executeForOutput(pipedProject, arrayOf(inputFilePath, "--verbose"))

        // Assert
        for (file in parsedFiles) {
            assertThat(errContent.toString()).contains("Calculating metrics for file $file")
        }
        assertThat(errContent.toString()).contains("Analysis of files complete, creating output file...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should display how many files and which file extensions were ignored after execution`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"

        System.setErr(PrintStream(errContent))

        // Act
        executeForOutput(pipedProject, arrayOf(inputFilePath))

        // Assert
        assertThat(errContent.toString()).contains(
            "2 Files with the following extensions were ignored as they are currently not supported:",
            ".json",
            ".strange"
        )

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should only include file extensions that we specified when file-extensions flag is set`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}kotlinOnly.cc.json").absoluteFile

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--file-extensions=.kt"))

        // Assert
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `should display warning when a file extension specified to be included was not found in project`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}kotlinOnly.cc.json").absoluteFile
        val invalidFileExtension = ".invalid"
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--file-extensions=.kt, $invalidFileExtension"))

        // Assert
        assertThat(errContent.toString())
            .contains("From the specified file extensions to parse, [$invalidFileExtension] were not found in the given input!")
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should correctly exclude files and folders if exclude pattern was specified`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}excludePattern.cc.json").absoluteFile
        val excludePattern = "/bar/, foo.kt, .*.py"

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "-e=$excludePattern"))

        // Assert
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `should include normally excluded folders when without-default-excludes flag is set`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}includeAll.cc.json").absoluteFile

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--include-build-folders"))

        // Assert
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `should produce empty output file when no parsable files were found in project`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val expectedResultFile = File("${testResourceBaseFolder}empty.cc.json").absoluteFile

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--file-extensions=.invalid"))

        // Assert
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)
    }

    @Test
    fun `should reuse metrics from base file when checksums match`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val baseFilePath = "${testResourceBaseFolder}sampleProject.cc.json"
        val expectedResultFile = File("${testResourceBaseFolder}sampleProject.cc.json").absoluteFile
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--base-file=$baseFilePath"))

        // Assert
        assertThat(errContent.toString()).contains("Loaded 6 file nodes from base file for checksum comparison")
        assertThat(errContent.toString()).contains("Checksum comparison: 6 files skipped, 0 files analyzed (100% reused)")
        JSONAssert.assertEquals(result, expectedResultFile.readText(), JSONCompareMode.NON_EXTENSIBLE)

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should show warning when base file does not exist`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        val baseFilePath = "${testResourceBaseFolder}nonexistent.cc.json"
        System.setErr(PrintStream(errContent))

        // Act
        executeForOutput(pipedProject, arrayOf(inputFilePath, "--base-file=$baseFilePath"))

        // Assert
        assertThat(errContent.toString()).contains("Base file")
        assertThat(errContent.toString()).contains("does not exist, continuing with normal analysis...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should exclude files based on gitignore when gitignore file exists`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}gitignore-test-project"
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath))

        // Assert
        assertThat(result).doesNotContain("ignored.exclude")
        assertThat(result).doesNotContain("excluded-dir/")
        assertThat(result).doesNotContain("output.kt")
        assertThat(result).doesNotContain("deep.kt")
        assertThat(errContent.toString()).contains("excluded by .gitignore rules")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should not exclude files when bypass-gitignore flag is set`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}gitignore-test-project"
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "--bypass-gitignore"))

        // Assert
        assertThat(result).contains("Main.kt")
        assertThat(result).contains("NotIgnored.kt")
        assertThat(errContent.toString()).doesNotContain("excluded by .gitignore")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should apply both gitignore and exclude patterns when both are specified`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}gitignore-test-project"
        val excludePattern = "Main.kt"
        System.setErr(PrintStream(errContent))

        // Act
        val result = executeForOutput(pipedProject, arrayOf(inputFilePath, "-e=$excludePattern"))

        // Assert
        assertThat(result).doesNotContain("ignored.exclude")
        assertThat(result).doesNotContain("excluded-dir")
        assertThat(result).doesNotContain("Main.kt")
        assertThat(result).contains("NotIgnored.kt")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should report gitignore statistics in verbose mode`() {
        // Arrange
        val pipedProject = ""
        val inputFilePath = "${testResourceBaseFolder}sampleproject"
        System.setErr(PrintStream(errContent))

        // Act
        executeForOutput(pipedProject, arrayOf(inputFilePath, "--verbose"))

        // Assert
        assertThat(errContent.toString()).contains("Analysis of files complete")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should produce same output from parse API and CLI for same inputs`() {
        // Arrange
        val inputFilePath = File("${testResourceBaseFolder}sampleproject")
        val excludePatterns = listOf("/bar/", "foo.kt", ".*.py")

        // Act - Parse using public API
        val apiResult = UnifiedParser.parse(
            inputFile = inputFilePath,
            excludePatterns = excludePatterns,
            fileExtensions = emptyList(),
            bypassGitignore = false,
            includeBuildFolders = false,
            verbose = false
        )

        // Act - Parse using CLI
        val pipedProject = ""
        val cliResult = executeForOutput(
            pipedProject,
            arrayOf(inputFilePath.path, "-e=/bar/,foo.kt,.*.py")
        )

        // Assert - Both should have same structure
        assertThat(apiResult.rootNode).isNotNull
        assertThat(cliResult).contains("whenCase.kt")
        assertThat(cliResult).contains("helloWorld.ts")
        assertThat(cliResult).doesNotContain("\"name\":\"foo.kt\"")
        assertThat(cliResult).doesNotContain("\"name\":\"bar\"")
    }

    @Test
    fun `should include build folders when includeBuildFolders is true via parse API`() {
        // Arrange
        val inputFilePath = File("${testResourceBaseFolder}sampleproject")

        // Act
        val result = UnifiedParser.parse(
            inputFile = inputFilePath,
            includeBuildFolders = true
        )

        // Assert - Should include .whatever folder content
        assertThat(result.rootNode.children.any { it.name == ".whatever" }).isTrue()
    }

    @Test
    fun `should exclude build folders by default via parse API when no gitignore exists`() {
        // Arrange
        val inputFilePath = File("${testResourceBaseFolder}sampleproject")

        // Act
        val result = UnifiedParser.parse(
            inputFile = inputFilePath,
            includeBuildFolders = false
        )

        // Assert - Should exclude .whatever folder
        assertThat(result.rootNode.children.any { it.name == ".whatever" }).isFalse()
    }
}
