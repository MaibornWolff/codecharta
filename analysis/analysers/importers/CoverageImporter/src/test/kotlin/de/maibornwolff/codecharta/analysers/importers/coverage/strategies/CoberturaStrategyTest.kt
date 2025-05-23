package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class CoberturaStrategyTest {
    private val testReportFilePath = "src/test/resources/formats/cobertura/coverage.cobertura.xml"
    private val expectedOutputPath = "src/test/resources/formats/cobertura/coverage.cc.json"

    @Test
    fun `should correctly import coverage report and build project structure`() {
        val projectBuilder = ProjectBuilder()

        CoberturaStrategy().addNodesToProjectBuilder(File(testReportFilePath), projectBuilder, System.err)

        val project = projectBuilder.build()
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedOutputPath).inputStream())

        assertThat(
            project
        ).usingRecursiveComparison().ignoringFields("attributeDescriptors", "attributeTypes", "blacklist").isEqualTo(expectedProject)
    }

    @Test
    fun `should handle empty report files gracefully and print error`() {
        val emptyReportFilePath = "src/test/resources/formats/cobertura/empty.cobertura.xml"
        val expectedRootNode = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder()
        val errorStreamContent = ByteArrayOutputStream()

        CoberturaStrategy().addNodesToProjectBuilder(File(emptyReportFilePath), projectBuilder, PrintStream(errorStreamContent))

        assertThat(projectBuilder.rootNode.toString()).isEqualTo(expectedRootNode.toString())
        assertThat(errorStreamContent.toString()).contains("Error while parsing XML file:")
    }

    @Test
    fun `should handle report without packages gracefully and print error`() {
        val noPackagesReportFilePath = "src/test/resources/formats/cobertura/no_packages.cobertura.xml"
        val expectedRootNode = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder()
        val errorStreamContent = ByteArrayOutputStream()

        CoberturaStrategy().addNodesToProjectBuilder(File(noPackagesReportFilePath), projectBuilder, PrintStream(errorStreamContent))

        assertThat(projectBuilder.rootNode.toString()).isEqualTo(expectedRootNode.toString())
        assertThat(errorStreamContent.toString()).contains("The coverage report file does not contain any package elements.")
    }
}
