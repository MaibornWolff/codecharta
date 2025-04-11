package de.maibornwolff.codecharta.analysers.importers.sourcemonitor

import de.maibornwolff.codecharta.analysers.importers.sourcemonitor.SourceMonitorImporter.Companion.main
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SourceMonitorImporterTest {
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/sourcemonitor.csv",
                "-nc",
                "-o=src/test/resources/sourcemonitor.cc.json"
            )
        )
        val file = File("src/test/resources/sourcemonitor.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        main(arrayOf("src/test/resources/sourcemonitor.csv", "-o=src/test/resources/sourcemonitor.cc.json"))
        val file = File("src/test/resources/sourcemonitor.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should contain all existing descriptors`() {
        main(
            arrayOf(
                "src/test/resources/sourcemonitor.csv",
                "-nc",
                "-o=src/test/resources/sourcemonitor.cc.json"
            )
        )
        val file = File("src/test/resources/sourcemonitor.cc.json")
        val inputStream = file.inputStream()
        val project = ProjectDeserializer.deserializeProject(inputStream)
        inputStream.close()
        file.deleteOnExit()
        assertEquals(project.attributeDescriptors, getAttributeDescriptors())
    }

    @Test
    fun `should stop execution if input file is invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        main(arrayOf("thisDoesNotExist.cc.json"))
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString())
            .contains("Input invalid file for SourceMonitorImporter, stopping execution")
    }
}
