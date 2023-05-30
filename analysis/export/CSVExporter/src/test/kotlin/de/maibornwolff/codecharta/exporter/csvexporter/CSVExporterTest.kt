package de.maibornwolff.codecharta.exporter.csvexporter

import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.verify
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.FileInputStream
import java.io.PrintStream
import java.lang.IllegalArgumentException

class CSVExporterTest {
    val outContent = ByteArrayOutputStream()
    val originalOut = System.out

    @Test
    fun `should abort if input is invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.getInputFileListIfValid(any(), any())
        } throws IllegalArgumentException()

        mockkObject(ProjectDeserializer)
        every {
            ProjectDeserializer.deserializeProject(any<FileInputStream>())
        } returns Project("")

        System.setOut(PrintStream(outContent))
        CommandLine(CSVExporter()).execute(
                "src/test/resources/dummyFile.cc.json",
                "src/test/resources/thisDoesNotExist.cc.json").toString()
        System.setOut(originalOut)

        Assertions.assertThat(outContent.toString()).contains("Aborting execution because of invalid input resources!")

        verify(exactly = 0) { ProjectDeserializer.deserializeProject(any<FileInputStream>()) }
    }
}
