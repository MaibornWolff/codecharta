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

class JavaStrategyTest {
    private val testReportFilePath = "src/test/resources/languages/java/jacoco.xml"
    private val expectedOutputPath = "src/test/resources/languages/java/coverage.cc.json"

    @Test
    fun `should correctly import coverage report and build project structure`() {
        val projectBuilder = ProjectBuilder()

        JavaStrategy().addNodesToProjectBuilder(File(testReportFilePath), projectBuilder, System.err)

        val project = projectBuilder.build()
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedOutputPath).inputStream())

        assertThat(project).usingRecursiveComparison().ignoringFields("attributeDescriptors", "attributeTypes", "blacklist")
            .isEqualTo(expectedProject)
    }

    @Test
    fun `should handle empty report files gracefully and print error`() {
        val emptyReportFilePath = "src/test/resources/languages/java/empty_jacoco.xml"
        val expectedRootNode = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder()
        val errorStreamContent = ByteArrayOutputStream()

        JavaStrategy().addNodesToProjectBuilder(File(emptyReportFilePath), projectBuilder, PrintStream(errorStreamContent))

        assertThat(projectBuilder.rootNode.toString()).isEqualTo(expectedRootNode.toString())
        assertThat(errorStreamContent.toString()).contains("Error while parsing XML file:")
    }

    @Test
    fun `should handle report without packages gracefully and print error`() {
        val noPackagesReportFilePath = "src/test/resources/languages/java/no_packages_jacoco.xml"
        val expectedRootNode = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder()
        val errorStreamContent = ByteArrayOutputStream()

        JavaStrategy().addNodesToProjectBuilder(File(noPackagesReportFilePath), projectBuilder, PrintStream(errorStreamContent))

        assertThat(projectBuilder.rootNode.toString()).isEqualTo(expectedRootNode.toString())
        assertThat(errorStreamContent.toString()).contains("The coverage report file does not contain any package elements.")
    }
}
