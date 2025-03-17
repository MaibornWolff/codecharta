import de.maibornwolff.codecharta.importer.coverage.CoverageImporter
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.skyscreamer.jsonassert.JSONParser
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
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
                "--language=javascript",
                "--report-file=$reportFilePath"
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
        CommandLine(CoverageImporter()).execute("--language=javascript", "--report-file=${notExistingFile.path}")
        System.setErr(originalErr)

        assertThat(errContent.toString()).startsWith("java.io.FileNotFoundException: File not found: src/test/lcov.info")
    }

    @Test
    fun `should throw IOException if no report files are found`() {
        val directory = File("src/test/kotlin")
        directory.mkdirs()

        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute("--language=javascript", "--report-file=${directory.path}")
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("No matching files found in directory:")
    }

    @Test
    fun `should throw IOException if multiple report files are found`() {
        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        System.setErr(PrintStream(errContent))
        CommandLine(CoverageImporter()).execute("--language=javascript")
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Multiple matching files found in directory:")
    }

    @Test
    fun `should generate correct cc json from a valid coverage report`() {
        val cliResult = executeForOutput(
            "",
            arrayOf(
                "--language=javascript",
                "--report-file=$reportFilePath"
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
                "--language=js",
                "--report-file=$reportFilePath",
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
                "--language=js",
                "--report-file=$reportFilePath",
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
        val cliResult = executeForOutput(input, arrayOf("-l=js", "-rf=$reportFilePath"))

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\"", "app.config.ts", "codeCharta.api.model.ts"))
        assertThat(JSONParser.parseJSON(cliResult)).usingRecursiveComparison().isEqualTo(JSONParser.parseJSON(expectedOutput))
    }

    @Test
    fun `should generate correct attributes types`() {
        val cliResult = executeForOutput(
            "",
            arrayOf(
                "--language=typescript",
                "--report-file=$reportFilePath"
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
                "--language=typescript",
                "--report-file=$reportFilePath"
            )
        )

        val project = ProjectDeserializer.deserializeProject(cliResult)
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
                "--language=javascript",
                "--report-file=src/test/resources/languages/javascript/empty_lcov.info"
            )
        )

        assertThat(cliResult).contains(listOf("checksum", "data", "\"projectName\":\"\""))
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
