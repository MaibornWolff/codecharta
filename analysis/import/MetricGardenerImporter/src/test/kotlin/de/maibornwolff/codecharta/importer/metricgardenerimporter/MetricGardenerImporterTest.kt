package de.maibornwolff.codecharta.importer.metricgardenerimporter

import de.maibornwolff.codecharta.importer.metricgardenerimporter.MetricGardenerImporter.Companion.main
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class MetricGardenerImporterTest {

    private val metricGardenerImporter = MetricGardenerImporter()

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "--is-json-file", "src/test/resources/metricgardener-analysis.json", "-nc",
                "-o=src/test/resources/import-result"
            )
        )
        val file = File("src/test/resources/import-result.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
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
                "-o=src/test/resources/import-result"
            )
        )
        val file = File("src/test/resources/import-result.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create no file when the input file was not specified`() {
        main(
            arrayOf(
                "-o=src/test/resources/import-result.json"
            )
        )
        val file = File("src/test/resources/import-result.cc.json.gz")
        file.deleteOnExit()
        metricGardenerImporter.call()
        assertFalse(file.exists())
    }
}
