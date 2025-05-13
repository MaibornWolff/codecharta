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
    private val reportFilePath = "src/test/resources/formats/lcov/minimal_lcov.info"

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
                "--format=lcov"
            )
        )

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\""))
    }

    @Test
    fun `should throw exception if no format is provided`() {
        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute()
        System.setErr(originalErr)

        assertThat(errContent.toString()).startsWith("Missing required option: '--format=<reportFormat>'")
    }

    @Test
    fun `should throw FileNotFoundException if provided file does not exist`() {
        val notExistingFile = File("src/test/lcov.info")

        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute(notExistingFile.path, "--format=lcov")
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
        CommandLine(CoverageImporter()).execute(directory.path, "--format=lcov")
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("No files matching lcov.info found in directory:")
    }

    @Test
    fun `should throw IOException if multiple report files are found`() {
        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute("--format=lcov")
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Multiple files matching lcov.info found in directory:")
    }

    @Test
    fun `should generate correct cc json from a valid coverage report`() {
        val cliResult = executeForOutput(
            "",
            arrayOf(
                reportFilePath,
                "--format=lcov"
            )
        )

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\"", "app.config.ts"))
    }

    @Test
    fun `should throw error when an illegal format is provided`() {
        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute("--format=illegal_format")
        System.setErr(originalErr)

        assertThat(errContent.toString()).startsWith("java.lang.IllegalArgumentException: Unsupported format found: illegal_format")
    }

    @Test
    fun `should produce uncompressed output when --not-compressed is set`() {
        executeForOutput(
            "",
            arrayOf(
                reportFilePath,
                "--format=lcov",
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
                "--format=lcov",
                "-o=src/test/resources/output"
            )
        )
        val file = File("src/test/resources/output.cc.json.gz")
        file.deleteOnExit()

        assertThat(file.exists()).isTrue
    }

    @Test
    fun `should handle piped input`() {
        val alreadyImportedCoverage = "src/test/resources/formats/lcov/coverage_full_paths.cc.json"
        val expectedOutputFileName = "src/test/resources/formats/lcov/expected_piped_output.cc.json"
        val expectedOutput = File(expectedOutputFileName).bufferedReader().readLines()
            .joinToString(separator = "\n") { it }

        val input = File(alreadyImportedCoverage).bufferedReader().readLines()
            .joinToString(separator = "\n") { it }
        val cliResult = executeForOutput(input, arrayOf(reportFilePath, "-f=lcov", "--keep-leading-paths"))

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\"", "app.config.ts", "codeCharta.api.model.ts"))
        assertThat(JSONParser.parseJSON(cliResult)).usingRecursiveComparison().isEqualTo(JSONParser.parseJSON(expectedOutput))
    }

    @Test
    fun `should generate correct attributes types`() {
        val cliResult = executeForOutput(
            "",
            arrayOf(
                reportFilePath,
                "--format=lcov"
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
                "--format=lcov"
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
                "src/test/resources/formats/lcov/empty_lcov.info",
                "--format=lcov"
            )
        )

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\""))
    }

    @Test
    fun `should find the default report file`() {
        val directory = File("src/test/resources/formats/lcov/nested")
        val expectedFile = File("src/test/resources/formats/lcov/nested/lcov.info")

        val result = CoverageImporter().getReportFileFromString(directory.path, Format.LCOV)

        assertThat(result).isEqualTo(expectedFile)
    }

    @Test
    fun `should return file if input is a file matching the default file`() {
        val file = File("src/test/resources/formats/lcov/lcov.info")

        val result = CoverageImporter().getReportFileFromString(file.path, Format.LCOV)

        assertThat(result).isEqualTo(file)
    }

    @Test
    fun `should return file if input is a file with correct extension`() {
        val file = File("src/test/resources/formats/lcov/minimal_lcov.info")

        val result = CoverageImporter().getReportFileFromString(file.path, Format.LCOV)

        assertThat(result).isEqualTo(file)
    }

    @Test
    fun `should throw no file found if there is no matching file`() {
        val directory = File("src/test/kotlin")

        assertThatThrownBy { CoverageImporter().getReportFileFromString(directory.path, Format.LCOV) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("No files matching lcov.info found in directory:")
    }

    @Test
    fun `should throw file not found if file does not exist`() {
        val file = File("src/test/resources/formats/lcov/non_existent_file.info")

        assertThatThrownBy { CoverageImporter().getReportFileFromString(file.path, Format.LCOV) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("File not found")
    }

    @Test
    fun `should throw no matching file extension if file does not match any known file extension`() {
        val file = File("src/test/resources/formats/lcov/invalid_existing_file.txt")

        assertThatThrownBy { CoverageImporter().getReportFileFromString(file.path, Format.LCOV) }
            .isInstanceOf(FileNotFoundException::class.java)
            .hasMessageContaining("does not match any known file extension")
    }

    @Test
    fun `should throw multiple files found if multiple files match the default file`() {
        val directory = File("src/test/resources/formats/lcov")

        assertThatThrownBy { CoverageImporter().getReportFileFromString(directory.path, Format.LCOV) }
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
