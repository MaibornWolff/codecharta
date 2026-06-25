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
        assertThat(content).contains("attributeDescriptors")
        // The physical files are now real nodes in the files tree, so their names appear by name.
        assertThat(content).contains("FileA.ts")
        assertThat(content).contains("FileB.ts")
        file.reader().use {
            val project = ProjectDeserializer.deserializeProject(it)
            // The four symbols collapse to two file nodes under src.
            assertThat(project.rootNode.leafObjects.map { leaf -> leaf.name }).containsExactlyInAnyOrder("FileA.ts", "FileB.ts")
            // The single dependency edge connects those two file nodes (endpoints resolve from the tree by id).
            assertThat(project.edges).hasSize(1)
            assertThat(project.edges.single().attributes).containsKey("dependencies")
            assertThat(setOf(project.edges.single().fromNodeName, project.edges.single().toNodeName))
                .containsExactlyInAnyOrder("/root/src/FileA.ts", "/root/src/FileB.ts")
            // Each file node carries its aggregated in/out dependency weight as a default node metric.
            val fileA = project.rootNode.leafObjects.first { leaf -> leaf.name == "FileA.ts" }
            assertThat(fileA.attributes[DcJsonParser.OUTGOING_DEPENDENCIES]).isEqualTo(3.0)
            assertThat(project.attributeDescriptors).isEqualTo(getAttributeDescriptors())
        }
    }

    @Test
    fun `should build a file node for each unique physical path even without dependencies`() {
        // Arrange
        val inputFilePath = "${testResourceBaseFolder}self-referencing.dc.json"
        val outputFilePath = "${testResourceBaseFolder}self-ref-nodes-output.cc.json"
        val file = File(outputFilePath)
        file.deleteOnExit()

        // Act
        main(arrayOf(inputFilePath, "-nc", "-o=$outputFilePath"))

        // Assert: two symbols share one physical file, so exactly one leaf node is produced.
        file.reader().use {
            val project = ProjectDeserializer.deserializeProject(it)
            assertThat(project.edges).isEmpty()
            assertThat(project.rootNode.leafObjects.map { leaf -> leaf.name }).containsExactly("File.ts")
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
