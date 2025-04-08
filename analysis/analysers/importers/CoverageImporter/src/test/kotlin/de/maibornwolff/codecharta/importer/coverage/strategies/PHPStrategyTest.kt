package de.maibornwolff.codecharta.importer.coverage.strategies

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.ProjectBuilder
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class PHPStrategyTest {
    private val testReportFilePath = "src/test/resources/languages/php/coverage.xml"

    @Test
    fun `should correctly import coverage report and build project structure`() {
        var projectBuilder = ProjectBuilder()

        PHPStrategy().addNodesToProjectBuilder(File(testReportFilePath), projectBuilder, System.err)


        val project = projectBuilder.build()
        val projectString = project.toString()

        assertThat(false)
    }

    @Test
    fun `should handle empty report files gracefully and print error`() {
        val emptyReportFilePath = "src/test/resources/languages/php/empty_xdebug.xml"
        val expectedRootNode = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder()
        val errorStreamContent = ByteArrayOutputStream()

        PHPStrategy().addNodesToProjectBuilder(File(emptyReportFilePath), projectBuilder, PrintStream(errorStreamContent))

        assertThat(projectBuilder.rootNode.toString()).isEqualTo(expectedRootNode.toString())
        assertThat(errorStreamContent.toString()).contains("Error while parsing XML file:")
    }
}
