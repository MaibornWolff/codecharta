package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis

import de.maibornwolff.codecharta.analysers.analyserinterface.scan.SourceFileScanner
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzerFactory
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.progress.SilentProgressReporter
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class ExtractionPipelineTest {
    @TempDir
    lateinit var projectDirectory: File

    private val errorStream = ByteArrayOutputStream()
    private val originalErrorStream = System.err

    @BeforeEach
    fun redirectStandardError() {
        System.setErr(PrintStream(errorStream))
    }

    @AfterEach
    fun restoreStandardError() {
        System.setErr(originalErrorStream)
    }

    private fun pipeline(
        fileTimeoutSeconds: Int = ExtractionPipeline.NO_FILE_TIMEOUT,
        createAnalyzer: (FileInfo) -> LanguageAnalyzer = LanguageAnalyzerFactory::createAnalyzer
    ) = ExtractionPipeline(
        SourceFileScanner(SupportedLanguage.allSuffixes()),
        SilentProgressReporter,
        fileTimeoutSeconds = fileTimeoutSeconds,
        createAnalyzer = createAnalyzer
    )

    private fun analyzerThatFailsOn(fileName: String): (FileInfo) -> LanguageAnalyzer = { fileInfo ->
        if (fileInfo.physicalPath ==
            fileName
        ) {
            throw IllegalStateException("cannot parse")
        } else {
            LanguageAnalyzerFactory.createAnalyzer(fileInfo)
        }
    }

    private fun analyzerThatStallsOn(fileName: String, millis: Long): (FileInfo) -> LanguageAnalyzer = { fileInfo ->
        val analyzer = LanguageAnalyzerFactory.createAnalyzer(fileInfo)
        if (fileInfo.physicalPath == fileName) {
            LanguageAnalyzer {
                Thread.sleep(millis)
                analyzer.analyze()
            }
        } else {
            analyzer
        }
    }

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

    @Test
    fun `should leave out a file whose analysis fails and warn which one`() {
        // Arrange
        writeSources()

        // Act
        val reports = pipeline(createAnalyzer = analyzerThatFailsOn("Item.kt")).run(projectDirectory, bypassGitignore = true)

        // Assert
        assertThat(reports.flatMap { it.nodes }.map { it.pathWithName.withDots() }).containsExactly("shop.Service")
        assertThat(errorStream.toString()).contains("1 file(s) could not be analysed").contains("Item.kt")
    }

    @Test
    fun `should leave out a file whose analysis exceeds the timeout and warn which one`() {
        // Arrange
        writeSources()
        val stalling = analyzerThatStallsOn("Item.kt", millis = 3000)

        // Act
        val reports = pipeline(fileTimeoutSeconds = 1, createAnalyzer = stalling).run(projectDirectory, bypassGitignore = true)

        // Assert
        assertThat(reports.flatMap { it.nodes }.map { it.pathWithName.withDots() }).containsExactly("shop.Service")
        assertThat(errorStream.toString()).contains("Timeout after 1s").contains("1 file(s) could not be analysed")
    }
}
