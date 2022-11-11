package de.maibornwolff.codecharta.importer.sourcemonitor

import de.maibornwolff.codecharta.importer.sourcemonitor.SourceMonitorImporter.Companion.main
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class SourceMonitorImporterTest {

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
}
