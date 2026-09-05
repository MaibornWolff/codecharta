package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.FileScanner
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.progress.SilentProgressReporter
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class ExtractionPipelineTest {
    @TempDir
    lateinit var projectDirectory: File

    private fun pipeline(fileTimeoutSeconds: Int = ExtractionPipeline.NO_FILE_TIMEOUT) =
        ExtractionPipeline(FileScanner(SupportedLanguage.allSuffixes()), SilentProgressReporter, fileTimeoutSeconds = fileTimeoutSeconds)

    private fun writeSources() {
        File(projectDirectory, "Item.kt").writeText("package shop\n\nclass Item")
        File(projectDirectory, "Service.kt").writeText("package shop\n\nclass Service { fun item(): Item = Item() }")
    }

    @Test
    fun `should extract every file with a per-file timeout enabled`() {
        // Arrange
        writeSources()

        // Act
        val reports = pipeline(fileTimeoutSeconds = 30).run(projectDirectory, bypassGitignore = true)

        // Assert
        assertThat(reports.flatMap { it.nodes }.map { it.pathWithName.withDots() }).containsExactlyInAnyOrder("shop.Item", "shop.Service")
    }

    @Test
    fun `should extract every file when no timeout is set`() {
        // Arrange
        writeSources()

        // Act
        val reports = pipeline().run(projectDirectory, bypassGitignore = true)

        // Assert
        assertThat(reports.flatMap { it.nodes }).hasSize(2)
    }

    @Test
    fun `should key a single-file input relative to its own directory`() {
        // Arrange
        writeSources()

        // Act
        val reports = pipeline().run(File(projectDirectory, "Service.kt"), bypassGitignore = true)

        // Assert
        assertThat(reports.flatMap { it.nodes }.map { it.physicalPath }).containsExactly("Service.kt")
    }

    @Test
    fun `should produce no report when the directory holds no supported source file`() {
        // Arrange
        File(projectDirectory, "notes.txt").writeText("nothing to parse")

        // Act
        val reports = pipeline().run(projectDirectory, bypassGitignore = true)

        // Assert
        assertThat(reports).isEmpty()
    }
}
