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
}
