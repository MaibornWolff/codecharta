package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.importer.csv.CSVImporter.Companion.main
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class CSVImporterTest {

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/csvimporter.csv", "-nc",
                "path-column-name=File Name",
                "-o=src/test/resources/csvimporter.cc.json"
            )
        )
        val file = File("src/test/resources/csvimporter.cc.json")
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
    fun `should contain Lines value of 44`() {
        main(
            arrayOf(
                "src/test/resources/sourcemonitor.csv", "-nc",
                "-o=src/test/resources/sourcemonitor.cc.json"
            )
        )
        val file = File("src/test/resources/sourcemonitor.cc.json")
        file.deleteOnExit()

        assertThat(file.readText()).contains(listOf("\"Lines\":44.0"))
    }
}
