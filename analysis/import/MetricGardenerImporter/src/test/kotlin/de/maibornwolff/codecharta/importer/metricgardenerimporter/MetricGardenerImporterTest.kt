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
                "src/test/resources/metricgardener-analysis.json", "-nc",
                "-o=src/test/resources/metricgardener-analysis.cc.json"
                   )
            )
        val file = File("src/test/resources/metricgardener-analysis.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "src/test/resources/metricgardener-analysis.json",
                "-o=src/test/resources/metricgardener-analysis.cc.json"
                   )
            )
        val file = File("src/test/resources/metricgardener-analysis.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create no file when the input file was not specified`() {
        main(
            arrayOf(
                "-o=src/test/resources/metricgardener-analysis.cc.json"
                   )
            )
        val file = File("src/test/resources/metricgardener-analysis.cc.json.gz")
        file.deleteOnExit()
        metricGardenerImporter.call()
        assertFalse(file.exists())
    }
    @Test
    fun `should create no file, if no output filename is specified`() {
        main(
                arrayOf(
                        "src/test/resources/metricgardener-analysis.json",
                        )
        )
        val file = File("src/test/resources/metricgardener-analysis.cc.json.gz")
        file.deleteOnExit()
        metricGardenerImporter.call()
        assertFalse(file.exists())
    }
}
