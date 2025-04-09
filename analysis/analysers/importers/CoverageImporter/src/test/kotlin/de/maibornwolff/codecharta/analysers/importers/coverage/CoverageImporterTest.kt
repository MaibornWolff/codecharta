package de.maibornwolff.codecharta.analysers.importers.coverage

import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.skyscreamer.jsonassert.JSONParser
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileNotFoundException
import java.io.PrintStream

class CoverageImporterTest {
    private val reportFilePath = "src/test/resources/languages/javascript/minimal_lcov.info"

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should use specified report file if it exists`() {
        val cliResult = executeForOutput(
            "",
            arrayOf(
                reportFilePath,
                "--language=javascript"
            )
        )

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\""))
    }

    @Test
    fun `should throw exception if no language is provided`() {
        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute()
        System.setErr(originalErr)

        assertThat(errContent.toString()).startsWith("Missing required option: '--language=<language>'")
    }

    @Test
    fun `should throw FileNotFoundException if provided file does not exist`() {
        val notExistingFile = File("src/test/lcov.info")

        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute(notExistingFile.path, "--language=javascript")
        System.setErr(originalErr)

        assertThat(errContent.toString()).startsWith("java.io.FileNotFoundException: File not found: ${notExistingFile.path}")
    }

    @Test
    fun `should throw IOException if no report files are found`() {
        val directory = File("src/test/kotlin")
        directory.mkdirs()

        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute(directory.path, "--language=javascript")
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("No files matching lcov.info found in directory:")
    }

    @Test
    fun `should throw IOException if multiple report files are found`() {
        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute("--language=javascript")
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Multiple files matching lcov.info found in directory:")
    }

    @Test
    fun `should generate correct cc json from a valid coverage report`() {
        val cliResult = executeForOutput(
            "",
            arrayOf(
                reportFilePath,
                "--language=javascript"
            )
        )

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\"", "app.config.ts"))
    }

    @Test
    fun `should throw error when an illegal language is provided`() {
        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute("--language=illegal_language")
        System.setErr(originalErr)

        assertThat(errContent.toString()).startsWith("java.lang.IllegalArgumentException: Unsupported language: illegal_language")
    }

    @Test
    fun `should produce uncompressed output when --not-compressed is set`() {
        executeForOutput(
            "",
            arrayOf(
                reportFilePath,
                "--language=js",
                "-o=src/test/resources/output",
                "--not-compressed"
            )
        )
        val file = File("src/test/resources/output.cc.json")
        file.deleteOnExit()

        assertThat(file.exists()).isTrue
    }

    @Test
    fun `should produce compressed output when --not-compressed is not set`() {
        executeForOutput(
            "",
            arrayOf(
                reportFilePath,
                "--language=js",
                "-o=src/test/resources/output"
            )
        )
        val file = File("src/test/resources/output.cc.json.gz")
        file.deleteOnExit()

        assertThat(file.exists()).isTrue
    }

    @Test
    fun `should handle piped input`() {
        val alreadyImportedCoverage = "src/test/resources/languages/javascript/coverage.cc.json"
        val expectedOutputFileName = "src/test/resources/languages/javascript/expected_piped_output.cc.json"
        val expectedOutput = File(expectedOutputFileName).bufferedReader().readLines()
            .joinToString(separator = "\n") { it }

        val input =
            File(alreadyImportedCoverage).bufferedReader().readLines()
                .joinToString(separator = "\n") { it }
        val cliResult = executeForOutput(input, arrayOf(reportFilePath, "-l=js"))

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\"", "app.config.ts", "codeCharta.api.model.ts"))
        assertThat(JSONParser.parseJSON(cliResult)).usingRecursiveComparison().isEqualTo(JSONParser.parseJSON(expectedOutput))
    }

    @Test
    fun `should generate correct attributes types`() {
        val cliResult = executeForOutput(
            "",
            arrayOf(
                reportFilePath,
                "--language=typescript"
            )
        )

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.attributeTypes).containsKey("nodes")
        assertThat(project.attributeTypes["nodes"]).isEqualTo(
            mapOf(
                "line_coverage" to AttributeType.RELATIVE,
                "branch_coverage" to AttributeType.RELATIVE,
                "statement_coverage" to AttributeType.RELATIVE
            )
        )
    }

    @Test
    fun `should generate all attribute descriptions`() {
        val cliResult = executeForOutput(
            "",
            arrayOf(
                reportFilePath,
                "--language=typescript"
            )
        )

        val project = ProjectDeserializer.deserializeProject(cliResult)
        assertThat(project.attributeDescriptors.size).isEqualTo(3)
        assertThat(project.attributeDescriptors).containsKey("line_coverage")
        assertThat(project.attributeDescriptors["line_coverage"]?.title).isEqualTo("Line Coverage")
        assertThat(project.attributeDescriptors).containsKey("branch_coverage")
        assertThat(project.attributeDescriptors["branch_coverage"]?.title).isEqualTo("Branch Coverage")
        assertThat(project.attributeDescriptors).containsKey("statement_coverage")
        assertThat(project.attributeDescriptors["statement_coverage"]?.title).isEqualTo("Statement Coverage")
    }

    @Test
    fun `should not crash on empty coverage report file`() {
        val cliResult = executeForOutput(
            "",
            arrayOf(
                "src/test/resources/languages/javascript/empty_lcov.info",
                "--language=javascript"
            )
        )

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\""))
    }

    @Test
    fun `should find the default report file`() {
        val directory = File("src/test/resources/languages/javascript/nested")
        val expectedFile = File("src/test/resources/languages/javascript/nested/lcov.info")

        val result = CoverageImporter().getReportFileFromString(directory.path, Language.JAVASCRIPT)

        assertThat(result).isEqualTo(expectedFile)
    }

    @Test
    fun `should return file if input is a file matching the default file`() {
        val file = File("src/test/resources/languages/javascript/lcov.info")

        val result = CoverageImporter().getReportFileFromString(file.path, Language.JAVASCRIPT)

        assertThat(result).isEqualTo(file)
    }

    @Test
    fun `should return file if input is a file with correct extension`() {
        val file = File("src/test/resources/languages/javascript/minimal_lcov.info")

        val result = CoverageImporter().getReportFileFromString(file.path, Language.JAVASCRIPT)

        assertThat(result).isEqualTo(file)
    }

    @Test
    fun `should throw no file found if there is no matching file`() {
        val directory = File("src/test/kotlin")

        assertThatThrownBy { CoverageImporter().getReportFileFromString(directory.path, Language.JAVASCRIPT) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("No files matching lcov.info found in directory:")
    }

    @Test
    fun `should throw file not found if file does not exist`() {
        val file = File("src/test/resources/languages/javascript/non_existent_file.info")

        assertThatThrownBy { CoverageImporter().getReportFileFromString(file.path, Language.JAVASCRIPT) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("File not found")
    }

    @Test
    fun `should throw no matching file extension if file does not match any known file extension`() {
        val file = File("src/test/resources/languages/javascript/invalid_existing_file.txt")

        assertThatThrownBy { CoverageImporter().getReportFileFromString(file.path, Language.JAVASCRIPT) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("does not match any known file extension")
    }

    @Test
    fun `should throw multiple files found if multiple files match the default file`() {
        val directory = File("src/test/resources/languages/javascript")

        assertThatThrownBy { CoverageImporter().getReportFileFromString(directory.path, Language.JAVASCRIPT) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("Multiple files matching lcov.info found in directory:")
    }
}

fun executeForOutput(input: String, args: Array<String> = emptyArray()): String {
    val inputStream = ByteArrayInputStream(input.toByteArray())

    val outputStream = ByteArrayOutputStream().use { byteArrayOutput ->
        PrintStream(byteArrayOutput).use { printStream ->
            CoverageImporter.mainWithInOut(
                inputStream,
                printStream,
                PrintStream(ByteArrayOutputStream()),
                args
            )
            byteArrayOutput.toString()
        }
    }

    return outputStream
}
