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

    @Test
    fun `should not be applicable when the resource is blank`() {
        val parser = DomainLanguageParser()

        val isApplicable = parser.isApplicable("   ")

        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should be applicable when the resource is a supported source file`(
        @TempDir tempDir: Path
    ) {
        val sourceFile = tempDir.resolve("Service.kt")
        sourceFile.writeText("class Service")

        val isApplicable = DomainLanguageParser().isApplicable(sourceFile.toString())

        assertThat(isApplicable).isTrue()
    }

    @Test
    fun `should not be applicable when the resource is a file of an unsupported extension`(
        @TempDir tempDir: Path
    ) {
        val unsupportedFile = tempDir.resolve("notes.txt")
        unsupportedFile.writeText("just prose")

        val isApplicable = DomainLanguageParser().isApplicable(unsupportedFile.toString())

        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should be applicable when a nested directory contains a supported source file`(
        @TempDir tempDir: Path
    ) {
        val nestedDirectory = tempDir.resolve("src/main/kotlin")
        nestedDirectory.createDirectories()
        nestedDirectory.resolve("Deep.kt").writeText("class Deep")

        val isApplicable = DomainLanguageParser().isApplicable(tempDir.toString())

        assertThat(isApplicable).isTrue()
    }

    @Test
    fun `should not be applicable when the directory holds no supported source file`(
        @TempDir tempDir: Path
    ) {
        tempDir.resolve("README.md").writeText("# docs")

        val isApplicable = DomainLanguageParser().isApplicable(tempDir.toString())

        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should not be applicable when the path does not exist`(
        @TempDir tempDir: Path
    ) {
        val missingPath = tempDir.resolve("this/does/not/exist").toString()

        val isApplicable = DomainLanguageParser().isApplicable(missingPath)

        assertThat(isApplicable).isFalse()
    }

    @ParameterizedTest
    @ValueSource(strings = ["--identifier-weight", "--comment-weight", "--string-weight"])
    fun `should stop execution when a weight option is not positive`(
        weightOption: String,
        @TempDir tempDir: Path
    ) {
        val projectDir = sourceProject(tempDir)

        val exitCode = CommandLine(DomainLanguageParser()).execute(projectDir, weightOption, "0")

        assertThat(exitCode).isNotZero()
        assertThat(errorStream.toString()).contains("$weightOption must be positive")
    }

    @Test
    fun `should stop execution when the limit is negative`(
        @TempDir tempDir: Path
    ) {
        val projectDir = sourceProject(tempDir)

        val exitCode = CommandLine(DomainLanguageParser()).execute(projectDir, "--limit", "-1")

        assertThat(exitCode).isNotZero()
        assertThat(errorStream.toString()).contains("--limit must not be negative")
    }

    @Test
    fun `should stop execution when the input file does not exist`() {
        val parser = DomainLanguageParser()

        val exitCode = CommandLine(parser).execute("thisDoesNotExist")

        assertThat(exitCode).isNotZero()
    }

    @Test
    fun `should analyse the project when no file extension filter is given`(
        @TempDir tempDir: Path
    ) {
        val projectDir = sourceProject(tempDir)

        val result = runParser(projectDir)

        assertThat(result).contains("inventory")
    }

    @Test
    fun `should skip files whose extension is excluded by the file extension option`(
        @TempDir tempDir: Path
    ) {
        val projectDir = sourceProject(tempDir)

        val result = runParser(projectDir, "-fe", "java")

        assertThat(result).doesNotContain("inventory")
    }

    @Test
    fun `should warn and continue when the piped project cannot be deserialized`(
        @TempDir tempDir: Path
    ) {
        val projectDir = sourceProject(tempDir)
        val outputStream = ByteArrayOutputStream()
        val parser = DomainLanguageParser(ByteArrayInputStream("not a cc.json".toByteArray()), PrintStream(outputStream))

        val exitCode = CommandLine(parser).execute(projectDir, "-", "-nc")

        assertThat(exitCode).isZero()
        assertThat(outputStream.toString()).contains("inventory")
    }

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
