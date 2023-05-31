package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.importer.codemaat.CodeMaatImporter.Companion.main
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
                "src/test/resources/coupling-codemaat.csv",
                "-nc",
                "-o=src/test/resources/coupling-codemaat.cc.json"
                   )
            )
        val file = File("src/test/resources/coupling-codemaat.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "src/test/resources/coupling-codemaat.csv",
                "-o=src/test/resources/coupling-codemaat.cc.json"
                   )
            )
        val file = File("src/test/resources/coupling-codemaat.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should contain expected content`() {
        main(
            arrayOf(
                "src/test/resources/coupling-codemaat.csv",
                "-nc",
                "-o=src/test/resources/coupling-codemaat-content.cc.json"
                   )
            )
        val file = File("src/test/resources/coupling-codemaat-content.cc.json")
        file.deleteOnExit()

        assertThat(file.readText()).contains("\"avgCommits\":5")
        assertThat(file.readText()).contains(listOf("attributeDescriptors", "\"description\":\"Average"))
        assertEquals(ProjectDeserializer.deserializeProject(file.reader()).attributeDescriptors, getAttributeDescriptors())
    }

    @Test
    fun `should stop execution if input file is invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        main(arrayOf("thisDoesNotExist.cc.json"))
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Input invalid file for CodeMaatImporter, stopping execution")
    }
}
