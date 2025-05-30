package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.assertj.core.api.AssertionsForClassTypes.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class LcovStrategyTest {
    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should contain minimal expected content`() {
        val expectedFilePath = "src/test/resources/formats/lcov/minimal_expected_output.cc.json"
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedFilePath).inputStream())
        val coverageReport = File("src/test/resources/formats/lcov/minimal_lcov.info")
        val projectBuilder = ProjectBuilder()

        LcovStrategy().addNodesToProjectBuilder(coverageReport, projectBuilder, System.err)

        val project = projectBuilder.build()
        assertThat(project).usingRecursiveComparison().isEqualTo(expectedProject)
    }

    @Test
    fun `should create correct cc json out of coverage report`() {
        val expectedFilePath = "src/test/resources/formats/lcov/coverage.cc.json"
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedFilePath).inputStream())
        val coverageReport = File("src/test/resources/formats/lcov/lcov.info")
        val projectBuilder = ProjectBuilder()

        LcovStrategy().addNodesToProjectBuilder(coverageReport, projectBuilder, System.err)

        val project = projectBuilder.build()
        assertThat(
            project
        ).usingRecursiveComparison().ignoringFields("attributeDescriptors", "attributeTypes", "blacklist").isEqualTo(expectedProject)
    }

    @Test
    fun `should keep folders surrounding the project when the flag is set`() {
        val expectedFilePath = "src/test/resources/formats/lcov/coverage_full_paths.cc.json"
        val expectedProject = ProjectDeserializer.deserializeProject(File(expectedFilePath).inputStream())
        val coverageReport = File("src/test/resources/formats/lcov/lcov.info")
        val projectBuilder = ProjectBuilder()

        LcovStrategy().addNodesToProjectBuilder(coverageReport, projectBuilder, System.err, true)

        val project = projectBuilder.build()
        assertThat(
            project
        ).usingRecursiveComparison().ignoringFields("attributeDescriptors", "attributeTypes", "blacklist").isEqualTo(expectedProject)
    }

    @Test
    fun `should handle empty report and print error`() {
        val emptyReportFilePath = "src/test/resources/formats/lcov/empty_lcov.info"
        val expectedRootNode = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder()
        val errorStreamContent = ByteArrayOutputStream()

        LcovStrategy().addNodesToProjectBuilder(File(emptyReportFilePath), projectBuilder, PrintStream(errorStreamContent))

        Assertions.assertThat(projectBuilder.rootNode.toString()).isEqualTo(expectedRootNode.toString())
        Assertions.assertThat(errorStreamContent.toString()).contains("The coverage file is empty.")
    }
}
