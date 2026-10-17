package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis

import de.maibornwolff.codecharta.analysers.analyserinterface.scan.SourceFileScanner
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.progress.SilentProgressReporter
import de.maibornwolff.treesitter.excavationsite.api.GrammarUnavailableException
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
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
        createAnalyzer: (FileInfo) -> LanguageAnalyzer = LanguageAnalyzerFactory::createAnalyzer,
        readContent: (File) -> String = File::readText
    ) = ExtractionPipeline(
        SourceFileScanner(SupportedLanguage.allSuffixes()),
        SilentProgressReporter,
        fileTimeoutSeconds = fileTimeoutSeconds,
        createAnalyzer = createAnalyzer,
        readContent = readContent
    )

    private fun unreadable(vararg fileNames: String): (File) -> String = { file ->
        if (file.name in fileNames) throw IOException("Permission denied") else file.readText()
    }

    private fun analyzerThatFailsOn(
        fileName: String,
        failure: Exception = IllegalStateException("cannot parse")
    ): (FileInfo) -> LanguageAnalyzer = { fileInfo ->
        if (fileInfo.physicalPath == fileName) throw failure else LanguageAnalyzerFactory.createAnalyzer(fileInfo)
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
        val reports = pipeline(fileTimeoutSeconds = 30).run(projectDirectory, bypassGitignore = true).reports

        // Assert
        assertThat(reports.flatMap { it.nodes }.map { it.pathWithName.withDots() }).containsExactlyInAnyOrder("shop.Item", "shop.Service")
    }

    @Test
    fun `should extract every file when no timeout is set`() {
        // Arrange
        writeSources()

        // Act
        val reports = pipeline().run(projectDirectory, bypassGitignore = true).reports

        // Assert
        assertThat(reports.flatMap { it.nodes }).hasSize(2)
    }

    @Test
    fun `should key a single-file input relative to its own directory`() {
        // Arrange
        writeSources()

        // Act
        val reports = pipeline().run(File(projectDirectory, "Service.kt"), bypassGitignore = true).reports

        // Assert
        assertThat(reports.flatMap { it.nodes }.map { it.physicalPath }).containsExactly("Service.kt")
    }

    @Test
    fun `should produce no report when the directory holds no supported source file`() {
        // Arrange
        File(projectDirectory, "notes.txt").writeText("nothing to parse")

        // Act
        val reports = pipeline().run(projectDirectory, bypassGitignore = true).reports

        // Assert
        assertThat(reports).isEmpty()
    }

    @Test
    fun `should leave out a file whose analysis fails and warn which one and why`() {
        // Arrange
        writeSources()

        // Act
        val extraction = pipeline(createAnalyzer = analyzerThatFailsOn("Item.kt")).run(projectDirectory, bypassGitignore = true)

        // Assert
        assertThat(extraction.reports.flatMap { it.nodes }.map { it.pathWithName.withDots() }).containsExactly("shop.Service")
        assertThat(extraction.failures.map { it.path }).containsExactly("Item.kt")
        assertThat(errorStream.toString())
            .contains("1 file could not be analysed and is missing from the output (IllegalStateException: cannot parse): Item.kt")
    }

    @Test
    fun `should leave out a file it cannot read and warn which one and why`() {
        // Arrange
        writeSources()

        // Act
        val extraction = pipeline(readContent = unreadable("Item.kt")).run(projectDirectory, bypassGitignore = true)

        // Assert
        assertThat(extraction.reports.flatMap { it.nodes }.map { it.pathWithName.withDots() }).containsExactly("shop.Service")
        assertThat(extraction.failures.map { it.path }).containsExactly("Item.kt")
        assertThat(errorStream.toString())
            .contains("1 file could not be analysed and is missing from the output (IOException: Permission denied): Item.kt")
    }

    @Test
    fun `should report every file as failed when it can read none`() {
        // Arrange
        writeSources()

        // Act
        val extraction = pipeline(readContent = unreadable("Item.kt", "Service.kt")).run(projectDirectory, bypassGitignore = true)

        // Assert
        assertThat(extraction.reports).isEmpty()
        assertThat(extraction.failures.map { it.path }).containsExactly("Item.kt", "Service.kt")
    }

    @Test
    fun `should stop at a grammar that does not fit the core instead of skipping its files`() {
        // Arrange
        writeSources()
        val failing = analyzerThatFailsOn("Item.kt", GrammarUnavailableException("The grammar is incompatible"))

        // Act & Assert
        assertThatThrownBy { pipeline(createAnalyzer = failing).run(projectDirectory, bypassGitignore = true) }
            .isInstanceOf(GrammarUnavailableException::class.java)
    }

    @Test
    fun `should leave out a file whose analysis exceeds the timeout and warn which one`() {
        // Arrange
        writeSources()
        val stalling = analyzerThatStallsOn("Item.kt", millis = 3000)

        // Act
        val extraction = pipeline(fileTimeoutSeconds = 1, createAnalyzer = stalling).run(projectDirectory, bypassGitignore = true)

        // Assert
        assertThat(extraction.reports.flatMap { it.nodes }.map { it.pathWithName.withDots() }).containsExactly("shop.Service")
        assertThat(errorStream.toString())
            .contains("1 file could not be analysed and is missing from the output (FileTimeoutException: Timeout after 1s): Item.kt")
    }
}
