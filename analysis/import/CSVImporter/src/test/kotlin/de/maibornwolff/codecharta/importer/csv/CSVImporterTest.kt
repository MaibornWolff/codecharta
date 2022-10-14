package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.importer.csv.CSVImporter.Companion.main
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import java.io.File

class CSVImporterTest {

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/csvimporter.csv", "-nc",
                "-o=src/test/resources/csvimporter.cc.json"
            )
        )
        val file = File("src/test/resources/csvimporter.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create a correct json when having a different path column name`() {
        main(
            arrayOf(
                "src/test/resources/csvimporter_different_path_column_name.csv", "-nc",
                "--path-separator=\\",
                "--path-column-name=File Name",
                "-o=src/test/resources/csvimporter.cc.json"
            )
        )
        val file = File("src/test/resources/csvimporter.cc.json")
        val expectedJsonFile = File("src/test/resources/csvimporter_different_path_column_name.cc.json")
        val testJsonString = file.readText()
        System.err.println(testJsonString)
        val expectedJsonString = expectedJsonFile.readText()
        file.deleteOnExit()

        JSONAssert.assertEquals(testJsonString, expectedJsonString, JSONCompareMode.STRICT)
    }

    @Test
    fun `should create json gzip file`() {
        main(arrayOf("src/test/resources/csvimporter.csv", "-o=src/test/resources/csvimporter.cc.json"))
        val file = File("src/test/resources/csvimporter.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should contain Lines value of 44`() {
        main(
            arrayOf(
                "src/test/resources/csvimporter.csv", "-nc",
                "-o=src/test/resources/csvimporter.cc.json"
            )
        )
        val file = File("src/test/resources/csvimporter.cc.json")
        file.deleteOnExit()

        assertThat(file.readText()).contains(listOf("\"Lines\":44.0"))
    }
}
