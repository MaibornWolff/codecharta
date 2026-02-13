package de.maibornwolff.codecharta.analysers.importers.dependacharta

import de.maibornwolff.codecharta.analysers.importers.dependacharta.DependaChartaImporter.Companion.main
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DependaChartaImporterTest {
    private val testResourceBaseFolder = "src/test/resources/"
    private var errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
        errContent = ByteArrayOutputStream()
    }

    @Test
    fun `should create json uncompressed file`() {
        // Arrange
        val inputFilePath = "${testResourceBaseFolder}simple.dc.json"
        val outputFilePath = "${testResourceBaseFolder}simple-output.cc.json"
        val outputFile = File(outputFilePath)
        outputFile.deleteOnExit()

        // Act
        main(arrayOf(inputFilePath, "-nc", "-o=$outputFilePath"))

        // Assert
        assertThat(outputFile).exists()
    }

    @Test
    fun `should create json gzip file`() {
        // Arrange
        val inputFilePath = "${testResourceBaseFolder}simple.dc.json"
        val outputFilePath = "${testResourceBaseFolder}simple-gzip-output.cc.json"
        val outputFileCompressed = File("$outputFilePath.gz")
        outputFileCompressed.deleteOnExit()

        // Act
        main(arrayOf(inputFilePath, "-o=$outputFilePath"))

        // Assert
        assertThat(outputFileCompressed).exists()
    }

    @Test
    fun `should contain expected edge content`() {
        // Arrange
        val inputFilePath = "${testResourceBaseFolder}multi-class-same-file.dc.json"
        val outputFilePath = "${testResourceBaseFolder}multi-class-output.cc.json"
        val file = File(outputFilePath)
        file.deleteOnExit()

        // Act
        main(arrayOf(inputFilePath, "-nc", "-o=$outputFilePath"))

        // Assert
        val content = file.readText()
        assertThat(content).contains("\"dependencies\":")
        assertThat(content).contains("/root/src/FileA.ts")
        assertThat(content).contains("/root/src/FileB.ts")
        assertThat(content).contains("attributeDescriptors")
        file.reader().use {
            val project = ProjectDeserializer.deserializeProject(it)
            assertThat(project.edges).hasSize(1)
            assertThat(project.attributeDescriptors).isEqualTo(getAttributeDescriptors())
        }
    }

    @Test
    fun `should produce no edges for self-referencing dependencies`() {
        // Arrange
        val inputFilePath = "${testResourceBaseFolder}self-referencing.dc.json"
        val outputFilePath = "${testResourceBaseFolder}self-ref-output.cc.json"
        val file = File(outputFilePath)
        file.deleteOnExit()

        // Act
        main(arrayOf(inputFilePath, "-nc", "-o=$outputFilePath"))

        // Assert
        file.reader().use {
            val project = ProjectDeserializer.deserializeProject(it)
            assertThat(project.edges).isEmpty()
        }
    }

    @Test
    fun `should produce valid project with no edges for empty dc json file`() {
        // Arrange
        val inputFilePath = "${testResourceBaseFolder}empty.dc.json"
        val outputFilePath = "${testResourceBaseFolder}empty-output.cc.json"
        val file = File(outputFilePath)
        file.deleteOnExit()

        // Act
        main(arrayOf(inputFilePath, "-nc", "-o=$outputFilePath"))

        // Assert
        file.reader().use {
            val project = ProjectDeserializer.deserializeProject(it)
            assertThat(project.edges).isEmpty()
            assertThat(project.rootNode).isNotNull()
        }
    }

    @Test
    fun `should stop execution if input file is invalid`() {
        // Arrange
        val nonExistentInputFilePath = "thisDoesNotExist.dc.json"

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))

        // Act
        main(arrayOf(nonExistentInputFilePath))

        // Assert
        assertThat(errContent.toString()).contains("Input invalid file for DependaChartaImporter, stopping execution")

        // clean up
        System.setErr(originalErr)
    }
}
