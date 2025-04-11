package de.maibornwolff.codecharta.analysers.importers.codemaat

import de.maibornwolff.codecharta.analysers.importers.codemaat.CodeMaatImporter.Companion.main
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CodeMaatImporterTest {
    private var errContent =
        ByteArrayOutputStream()
    private val originalErr =
        System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
        errContent = ByteArrayOutputStream()
    }

    @Test
    fun `should create json uncompressed file`() {
        // given
        val inputFilePath =
            "src/test/resources/coupling-codemaat.csv"
        val outputFilePath =
            "src/test/resources/coupling-codemaat.cc.json"
        val outputFile =
            File(outputFilePath)
        outputFile.deleteOnExit()

        // when
        main(arrayOf(inputFilePath, "-nc", "-o=$outputFilePath"))

        assertTrue(outputFile.exists())
    }

    @Test
    fun `should create json gzip file`() {
        // given
        val inputFilePath =
            "src/test/resources/coupling-codemaat.csv"
        val outputFilePath =
            "src/test/resources/coupling-codemaat.cc.json"
        val outputFilePathCompressed =
            "src/test/resources/coupling-codemaat.cc.json.gz"
        val outputFile =
            File(outputFilePathCompressed)
        outputFile.deleteOnExit()

        // when
        main(arrayOf(inputFilePath, "-o=$outputFilePath"))

        // then
        assertTrue(outputFile.exists())
    }

    @Test
    fun `should contain expected content`() {
        // given
        val inputFilePath =
            "src/test/resources/coupling-codemaat.csv"
        val outputFilePath =
            "src/test/resources/coupling-codemaat-content.cc.json"
        val file =
            File(outputFilePath)
        file.deleteOnExit()

        // when
        main(arrayOf(inputFilePath, "-nc", "-o=$outputFilePath"))

        // then
        assertThat(file.readText()).contains("\"avgCommits\":5")
        assertThat(file.readText()).contains(listOf("attributeDescriptors", "\"description\":\"Average"))
        file.reader().use {
            assertEquals(ProjectDeserializer.deserializeProject(it).attributeDescriptors, getAttributeDescriptors())
        }
    }

    @Test
    fun `should stop execution if input file is invalid`() {
        // given
        val nonExistentInputFilePath =
            "thisDoesNotExist.cc.json"

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))

        // when
        main(arrayOf(nonExistentInputFilePath))

        // then
        assertThat(errContent.toString()).contains("Input invalid file for CodeMaatImporter, stopping execution")

        // clean up
        System.setErr(originalErr)
    }
}
