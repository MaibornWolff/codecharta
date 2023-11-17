package de.maibornwolff.codecharta.exporter.csvexporter

import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CSVExporterTest {
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should handle single valid input file`() {

    }

    @Test
    fun `should handle two valid input files with appending`() {
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(CSVExporter()).execute("thisDoesNotExist.cc.json").toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Input invalid file for CSVExporter, stopping execution")
    }

    @Test
    fun `should handle mix of valid and invalid input files`() {
        // Implement the test logic
    }

    @Test
    fun `should handle nodes with empty values`() {
        // Implement the test logic
    }

    @Test
    fun `should handle nodes with null values`() {
        // Implement the test logic
    }

    @Test
    fun `should handle nodes with different attribute types`() {
        // Implement the test logic
    }

    @Test
    fun `should handle no output file specified (stdout case)`() {
        // Implement the test logic
    }

    @Test
    fun `should handle output file specified`() {
        // Implement the test logic
    }

    @Test
    fun `should handle existing output file with data (test overwriting)`() {
        // Implement the test logic
    }

    @Test
    fun `should stop execution if depth-of-hierarchy is negative`() {
        val filePath = "../../test/data/codecharta/csvexport_input.cc.json"
        Assertions.assertThat(File(filePath).exists())
        val maxHierarchy = -1
        System.setErr(PrintStream(errContent))
        CommandLine(CSVExporter()).execute("filePath", "--depth-of-hierarchy", "$maxHierarchy").toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("depth-of-hierarchy must not be negative")
    }
}
