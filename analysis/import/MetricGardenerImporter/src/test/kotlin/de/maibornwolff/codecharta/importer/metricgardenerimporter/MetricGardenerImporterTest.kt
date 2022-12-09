package de.maibornwolff.codecharta.importer.metricgardenerimporter

import de.maibornwolff.codecharta.importer.metricgardenerimporter.MetricGardenerImporter.Companion.main
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import picocli.CommandLine
import java.io.File

class MetricGardenerImporterTest {

    @Test
    fun `should create json uncompressed file with attribute Descriptors`() {
        main(
            arrayOf(
                "--is-json-file", "src/test/resources/metricgardener-analysis.json", "-nc",
                "-o=src/test/resources/import-result"
            )
        )
        val file = File("src/test/resources/import-result.cc.json")
        file.deleteOnExit()
        val inputStream = file.inputStream()
        val project = ProjectDeserializer.deserializeProject(inputStream)
        inputStream.close()

        // then
        assertTrue(file.exists())
        assertEquals(project.attributeDescriptors["rloc"], getAttributeDescriptors()["real_lines_of_code"])
        assertEquals(project.attributeDescriptors["loc"], getAttributeDescriptors()["lines_of_code"])
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "--is-json-file", "src/test/resources/metricgardener-analysis.json",
                "-o=src/test/resources/import-result"
            )
        )
        val file = File("src/test/resources/import-result.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create file when MG needs to run first`() {
        main(
            arrayOf(
                "src/test/resources/MetricGardenerRawFile.kt", "-nc",
                "-o=src/test/resources/import-result-mg"
            )
        )
        val file = File("src/test/resources/import-result-mg.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create no file when the input file was not specified`() {
        main(
            arrayOf(
                "-o=src/test/resources/import-result-empty.json"
            )
        )
        val file = File("src/test/resources/import-result-empty.cc.json.gz")
        file.deleteOnExit()
        CommandLine(MetricGardenerImporter()).execute()
        assertFalse(file.exists())
    }
}
