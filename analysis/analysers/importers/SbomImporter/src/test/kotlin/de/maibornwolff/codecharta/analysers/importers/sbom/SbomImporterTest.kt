package de.maibornwolff.codecharta.analysers.importers.sbom

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class SbomImporterTest {
    @TempDir
    lateinit var tempDir: File

    private val sbomFile = File("src/test/resources/trivy_sample.cdx.json").absolutePath

    @Test
    fun `should write a map with the lockfiles and the security lens and print the hints last`() {
        // Arrange
        val projectFolder = TestBoms.projectFolderWith(tempDir, "frontend/package-lock.json", "backend/package-lock.json")
        val output = ByteArrayOutputStream()
        val error = ByteArrayOutputStream()

        // Act
        SbomImporter.mainWithInOut(
            ByteArrayInputStream(ByteArray(0)),
            PrintStream(output),
            PrintStream(error),
            arrayOf(sbomFile, "--project-folder=${projectFolder.path}", "-nc")
        )

        // Assert
        val project = ProjectDeserializer.deserializeProject(output.toString().substringAfter(EXECUTION_STARTED_FLAG))
        assertThat(project.lenses.security!!.packages).hasSize(3)
        assertThat(project.lenses.security!!.nodes).hasSize(2)
        assertThat(error.toString().trim().lines().last()).contains("--deps-dev")
    }

    @Test
    fun `should merge the security lens into a piped map`() {
        // Arrange
        val projectFolder = TestBoms.projectFolderWith(tempDir, "frontend/package-lock.json", "backend/package-lock.json")
        val pipedProject = ProjectBuilder()
            .insertByPath(Path(listOf("frontend")), MutableNode("App.ts", NodeType.File, mapOf("rloc" to 10)))
            .build()
        val piped = ByteArrayInputStream(ProjectSerializer.serializeToString(pipedProject).toByteArray())
        val output = ByteArrayOutputStream()

        // Act
        SbomImporter.mainWithInOut(
            piped,
            PrintStream(output),
            PrintStream(ByteArrayOutputStream()),
            arrayOf(sbomFile, "--project-folder=${projectFolder.path}", "-nc")
        )

        // Assert
        val project = ProjectDeserializer.deserializeProject(output.toString().substringAfter(EXECUTION_STARTED_FLAG))
        val frontend = project.rootNode.children.single { it.name == "frontend" }
        assertThat(frontend.children.map { it.name }).containsExactlyInAnyOrder("App.ts", "package-lock.json")
        assertThat(project.lenses.security!!.packages).hasSize(3)
    }

    @Test
    fun `should not be applicable to a folder, since an SBOM is made by another tool first`() {
        // Arrange + Act
        val isApplicable = SbomImporter().isApplicable(tempDir.path)

        // Assert
        assertThat(isApplicable).isFalse()
    }

    companion object {
        private val EXECUTION_STARTED_FLAG = de.maibornwolff.codecharta.util.CodeChartaConstants.EXECUTION_STARTED_SYNC_FLAG
    }
}
