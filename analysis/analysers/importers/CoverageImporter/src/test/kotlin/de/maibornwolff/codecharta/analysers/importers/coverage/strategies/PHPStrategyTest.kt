package de.maibornwolff.codecharta.importer.coverage.strategies

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class PHPStrategyTest {
    private val complexTestReportFilePath = "src/test/resources/languages/php/coverage.xml"
    private val expectedOutputPath = "src/test/resources/languages/php/coverage.cc.json"

    @Test
    fun `should correctly import coverage report and build project structure when valid report was given`() {
        val projectBuilder = ProjectBuilder()

        PHPStrategy().addNodesToProjectBuilder(File(complexTestReportFilePath), projectBuilder, System.err)

        val project = projectBuilder.build()
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedOutputPath).inputStream())

        assertThat(project).usingRecursiveComparison().ignoringFields("attributeDescriptors", "attributeTypes", "blacklist")
            .isEqualTo(expectedProject)
    }

    @Test
    fun `should handle empty report files gracefully and print error`() {
        val emptyReportFilePath = "src/test/resources/languages/php/empty_coverage.xml"
        val expectedRootNode = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder()
        val errorStreamContent = ByteArrayOutputStream()

        PHPStrategy().addNodesToProjectBuilder(File(emptyReportFilePath), projectBuilder, PrintStream(errorStreamContent))

        assertThat(projectBuilder.rootNode.toString()).isEqualTo(expectedRootNode.toString())
        assertThat(errorStreamContent.toString()).contains("Error while parsing XML file:")
    }

    @Test
    fun `should handle report without files gracefully and print error`() {
        val noFilesReportFilePath = "src/test/resources/languages/php/no_files_report.xml"
        val expectedRootNode = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder()
        val errorStreamContent = ByteArrayOutputStream()

        PHPStrategy().addNodesToProjectBuilder(File(noFilesReportFilePath), projectBuilder, PrintStream(errorStreamContent))

        assertThat(projectBuilder.rootNode.toString()).isEqualTo(expectedRootNode.toString())
        assertThat(errorStreamContent.toString()).contains("The coverage report file does not contain any files.")
    }

    @Test
    fun `should handle reports with files that miss metric information gracefully and print error`() {
        val noFilesReportFilePath = "src/test/resources/languages/php/missing_metrics_report.xml"
        val expectedRootNode = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder()
        val errorStreamContent = ByteArrayOutputStream()

        PHPStrategy().addNodesToProjectBuilder(File(noFilesReportFilePath), projectBuilder, PrintStream(errorStreamContent))

        assertThat(projectBuilder.rootNode.toString()).isEqualTo(expectedRootNode.toString())
        assertThat(errorStreamContent.toString()).contains("No line-coverage information was found for the UserController.php file! Please ensure the xml file is correctly formatted.")
    }
}
