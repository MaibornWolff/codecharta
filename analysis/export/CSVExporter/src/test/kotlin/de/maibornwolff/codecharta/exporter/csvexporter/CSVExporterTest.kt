package de.maibornwolff.codecharta.exporter.csvexporter

import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.FileInputStream
import java.io.PrintStream
import kotlin.IllegalArgumentException

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CSVExporterTest {
    val outContent = ByteArrayOutputStream()
    val originalOut = System.out

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should not execute exporter if input is invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.getInputFileListIfValid(any(), any(), any())
        } throws IllegalArgumentException()

        mockkObject(ProjectDeserializer)
        every {
            ProjectDeserializer.deserializeProject(any<FileInputStream>())
        } returns Project("")

        System.setOut(PrintStream(outContent))
        try {
            CommandLine(CSVExporter()).execute(
                    "thisDoesNotExist.cc.json").toString()
        } catch (invalidArgumentException: IllegalArgumentException) {
            // do nothing
        }
        System.setOut(originalOut)

        verify(exactly = 0) { ProjectDeserializer.deserializeProject(any<FileInputStream>()) }
    }
}
