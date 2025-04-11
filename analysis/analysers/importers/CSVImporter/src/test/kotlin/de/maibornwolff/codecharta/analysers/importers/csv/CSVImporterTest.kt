package de.maibornwolff.codecharta.analysers.importers.csv

import de.maibornwolff.codecharta.analysers.importers.csv.CSVImporter.Companion.main
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.skyscreamer.jsonassert.JSONAssert
import org.skyscreamer.jsonassert.JSONCompareMode
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CSVImporterTest {
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
                "src/test/resources/csvimporter.csv",
                "-nc",
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
                "src/test/resources/csvimporter_different_path_column_name.csv",
                "-nc",
                "--path-separator=\\",
                "--path-column-name=File Name",
                "-o=src/test/resources/csvimporter-path.cc.json"
            )
        )
        val file = File("src/test/resources/csvimporter-path.cc.json")
        val expectedJsonFile = File("src/test/resources/csvimporter_different_path_column_name.cc.json")
        val testJsonString = file.readText()
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
                "src/test/resources/csvimporter.csv",
                "-nc",
                "-o=src/test/resources/csvimporter-content.cc.json"
            )
        )
        val file = File("src/test/resources/csvimporter-content.cc.json")
        file.deleteOnExit()

        assertThat(file.readText()).contains(listOf("\"Lines\":44.0"))
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

        assertThat(errContent.toString()).contains("Input invalid file for CSVImporter, stopping execution")
    }
}
