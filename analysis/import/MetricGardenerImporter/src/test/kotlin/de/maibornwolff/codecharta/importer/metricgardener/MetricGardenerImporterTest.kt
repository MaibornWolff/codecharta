package de.maibornwolff.codecharta.importer.metricgardener

import de.maibornwolff.codecharta.importer.metricgardener.MetricGardenerImporter.Companion.main
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class MetricGardenerImporterTest {

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
}
