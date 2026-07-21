package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.PrintStream
import java.nio.file.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.writeText

class DomainLanguageParserTest {
    private val errorStream = ByteArrayOutputStream()
    private val originalErrorStream = System.err

    @BeforeEach
    fun redirectStandardError() {
        System.setErr(PrintStream(errorStream))
    }

    @AfterEach
    fun restoreStandardError() {
        System.setErr(originalErrorStream)
    }

    // --- isApplicable ---

    @Test
    fun `should not be applicable when the resource is blank`() {
        // arrange
        val parser = DomainLanguageParser()

        // act
        val isApplicable = parser.isApplicable("   ")

        // assert
        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should be applicable when the resource is a supported source file`(
        @TempDir tempDir: Path
    ) {
        // arrange
        val sourceFile = tempDir.resolve("Service.kt")
        sourceFile.writeText("class Service")

        // act
        val isApplicable = DomainLanguageParser().isApplicable(sourceFile.toString())

        // assert
        assertThat(isApplicable).isTrue()
    }

    @Test
    fun `should not be applicable when the resource is a file of an unsupported extension`(
        @TempDir tempDir: Path
    ) {
        // arrange
        val unsupportedFile = tempDir.resolve("notes.txt")
        unsupportedFile.writeText("just prose")

        // act
        val isApplicable = DomainLanguageParser().isApplicable(unsupportedFile.toString())

        // assert
        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should be applicable when a nested directory contains a supported source file`(
        @TempDir tempDir: Path
    ) {
        // arrange
        val nestedDirectory = tempDir.resolve("src/main/kotlin")
        nestedDirectory.createDirectories()
        nestedDirectory.resolve("Deep.kt").writeText("class Deep")

        // act
        val isApplicable = DomainLanguageParser().isApplicable(tempDir.toString())

        // assert
        assertThat(isApplicable).isTrue()
    }

    @Test
    fun `should not be applicable when the directory holds no supported source file`(
        @TempDir tempDir: Path
    ) {
        // arrange
        tempDir.resolve("README.md").writeText("# docs")

        // act
        val isApplicable = DomainLanguageParser().isApplicable(tempDir.toString())

        // assert
        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should not be applicable when the path does not exist`(
        @TempDir tempDir: Path
    ) {
        // arrange
        val missingPath = tempDir.resolve("this/does/not/exist").toString()

        // act
        val isApplicable = DomainLanguageParser().isApplicable(missingPath)

        // assert
        assertThat(isApplicable).isFalse()
    }

    // --- validateOptions ---

    @ParameterizedTest
    @ValueSource(strings = ["--identifier-weight", "--comment-weight", "--string-weight"])
    fun `should stop execution when a weight option is not positive`(
        weightOption: String,
        @TempDir tempDir: Path
    ) {
        // arrange
        val projectDir = sourceProject(tempDir)

        // act
        val exitCode = CommandLine(DomainLanguageParser()).execute(projectDir, weightOption, "0")

        // assert
        assertThat(exitCode).isNotZero()
        assertThat(errorStream.toString()).contains("$weightOption must be positive")
    }

    @Test
    fun `should stop execution when the limit is negative`(
        @TempDir tempDir: Path
    ) {
        // arrange
        val projectDir = sourceProject(tempDir)

        // act
        val exitCode = CommandLine(DomainLanguageParser()).execute(projectDir, "--limit", "-1")

        // assert
        assertThat(exitCode).isNotZero()
        assertThat(errorStream.toString()).contains("--limit must not be negative")
    }

    @Test
    fun `should stop execution when the input file does not exist`() {
        // arrange
        val parser = DomainLanguageParser()

        // act
        val exitCode = CommandLine(parser).execute("thisDoesNotExist")

        // assert
        assertThat(exitCode).isNotZero()
    }

    // --- buildConfiguration ---

    @Test
    fun `should analyse the project when no file extension filter is given`(
        @TempDir tempDir: Path
    ) {
        // arrange
        val projectDir = sourceProject(tempDir)

        // act
        val result = runParser(projectDir)

        // assert
        assertThat(result).contains("inventory")
    }

    @Test
    fun `should skip files whose extension is excluded by the file extension option`(
        @TempDir tempDir: Path
    ) {
        // arrange
        val projectDir = sourceProject(tempDir)

        // act
        val result = runParser(projectDir, "-fe", "java")

        // assert
        assertThat(result).doesNotContain("inventory")
    }

    // --- resolvePipedProject ---

    @Test
    fun `should warn and continue when the piped project cannot be deserialized`(
        @TempDir tempDir: Path
    ) {
        // arrange
        val projectDir = sourceProject(tempDir)
        val outputStream = ByteArrayOutputStream()
        val parser = DomainLanguageParser(ByteArrayInputStream("not a cc.json".toByteArray()), PrintStream(outputStream))

        // act
        val exitCode = CommandLine(parser).execute(projectDir, "-", "-nc")

        // assert
        assertThat(exitCode).isZero()
        assertThat(outputStream.toString()).contains("inventory")
    }

    /** A minimal single-file Kotlin project whose identifiers carry a recognisable domain word. */
    private fun sourceProject(tempDir: Path): String {
        tempDir.resolve("InventoryService.kt").writeText(
            """
            class InventoryService {
                fun reserveInventoryItem() {}
            }
            """.trimIndent()
        )
        return tempDir.toString()
    }

    private fun runParser(projectDir: String, vararg options: String): String {
        val outputStream = ByteArrayOutputStream()
        val parser = DomainLanguageParser(ByteArrayInputStream(ByteArray(0)), PrintStream(outputStream))
        val exitCode = CommandLine(parser).execute(projectDir, "-nc", *options)
        assertThat(exitCode).isZero()
        return outputStream.toString()
    }
}
