package de.maibornwolff.codecharta.analysers.tools.gate.analysis

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.dependency.DependencyParser
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.DomainLanguageParser
import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedProject
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import picocli.CommandLine
import java.io.File

class ProjectAnalyserTest {
    @TempDir
    lateinit var projectFolder: File

    @Test
    fun `should merge the maps of every analyser into one project`() {
        // Arrange
        writeSource("src/App.kt", "fun main() {\n    if (true) println(1)\n}\n")

        // Act
        val project = ProjectAnalyser().analyse(
            projectFolder,
            listOf(ConfiguredAnalyser(RawTextParser()), ConfiguredAnalyser(UnifiedParser())),
            File(projectFolder, "out")
        )

        // Assert
        val metrics = AnalysedProject(project).files.single { it.path == "src/App.kt" }.metrics
        assertThat(metrics).containsKeys("indentation_level_1+", "complexity")
    }

    @Test
    fun `should leave the output folder out of the analysis`() {
        // Arrange
        writeSource("src/App.kt", "fun main() {}\n")
        writeSource("check-output/Old.kt", "fun old() {}\n")

        // Act
        val project = ProjectAnalyser().analyse(
            projectFolder,
            listOf(ConfiguredAnalyser(UnifiedParser())),
            File(projectFolder, "check-output")
        )

        // Assert
        assertThat(AnalysedProject(project).files.map { it.path }).containsExactly("src/App.kt")
    }

    @Test
    fun `should keep a nested folder that only shares its name with the output folder`() {
        // Arrange
        writeSource("src/checks/Kept.kt", "package checks\n\nfun kept() {}\n")
        writeSource("checks/Old.kt", "fun old() {}\n")
        val analysers = listOf(RawTextParser(), UnifiedParser(), DependencyParser(), DomainLanguageParser()).map { ConfiguredAnalyser(it) }

        // Act
        val project = ProjectAnalyser().analyse(projectFolder, analysers, File(projectFolder, "checks"))

        // Assert
        assertThat(AnalysedProject(project).files.map { it.path }).containsExactly("src/checks/Kept.kt")
    }

    @Test
    fun `should name the analyser that failed and why`() {
        // Arrange
        writeSource("src/App.kt", "fun main() {}\n")
        val analysers = listOf(ConfiguredAnalyser(FailingAnalyser()))

        // Act
        val failure = catchThrowable { ProjectAnalyser().analyse(projectFolder, analysers, File(projectFolder, "out")) }

        // Assert
        assertThat(failure).isInstanceOf(AnalysisException::class.java).hasMessageContaining("failingparser").hasMessageContaining("broken")
    }

    @Test
    fun `should refuse to analyse with no analyser`() {
        // Arrange
        val analysers = emptyList<ConfiguredAnalyser>()

        // Act
        val failure = catchThrowable { ProjectAnalyser().analyse(projectFolder, analysers, File(projectFolder, "out")) }

        // Assert
        assertThat(failure).isInstanceOf(AnalysisException::class.java).hasMessageContaining("No analyser")
    }

    @Test
    fun `should merge the same project whether the analysers run in parallel or one after another`() {
        // Arrange
        writeSource("src/App.kt", "fun main() {\n    if (true) println(1)\n}\n")
        writeSource("src/Util.kt", "fun help() = 1\n")
        val outputFolder = File(projectFolder, "out")

        // Act
        val sequential = ProjectAnalyser().analyse(projectFolder, bothAnalysers(), outputFolder)
        val parallel = ProjectAnalyser().analyse(projectFolder, bothAnalysers(), outputFolder, parallel = true)

        // Assert
        assertThat(AnalysedProject(parallel).files).containsExactlyInAnyOrderElementsOf(AnalysedProject(sequential).files)
    }

    @Test
    fun `should let the other analysers finish before giving up on a failed parallel run`() {
        // Arrange
        writeSource("src/App.kt", "fun main() {}\n")
        val slowAnalyser = SlowAnalyser()
        val analysers = listOf(ConfiguredAnalyser(FailingAnalyser()), ConfiguredAnalyser(slowAnalyser))

        // Act
        val failure = catchThrowable { ProjectAnalyser().analyse(projectFolder, analysers, File(projectFolder, "out"), parallel = true) }

        // Assert
        assertThat(failure).isInstanceOf(AnalysisException::class.java).hasMessageContaining("failingparser")
        assertThat(slowAnalyser.hasFinished).isTrue()
    }

    private fun bothAnalysers() = listOf(ConfiguredAnalyser(RawTextParser()), ConfiguredAnalyser(UnifiedParser()))

    private fun writeSource(path: String, content: String) {
        File(projectFolder, path).apply { parentFile.mkdirs() }.writeText(content)
    }

    @CommandLine.Command(name = "failingparser")
    private class FailingAnalyser : AnalyserInterface {
        override val name = "failingparser"
        override val description = "always fails"

        @CommandLine.Unmatched
        private var arguments: MutableList<String> = mutableListOf()

        override fun call(): Unit? = throw IllegalStateException("broken")

        override fun getDialog(): AnalyserDialogInterface = mockk()

        override fun isApplicable(resourceToBeParsed: String) = true
    }

    @CommandLine.Command(name = "slowparser")
    private class SlowAnalyser : AnalyserInterface {
        override val name = "slowparser"
        override val description = "takes its time and writes nothing"

        @Volatile
        var hasFinished = false

        @CommandLine.Unmatched
        private var arguments: MutableList<String> = mutableListOf()

        override fun call(): Unit? {
            Thread.sleep(SLOW_ANALYSIS_MILLISECONDS)
            hasFinished = true
            return null
        }

        override fun getDialog(): AnalyserDialogInterface = mockk()

        override fun isApplicable(resourceToBeParsed: String) = true
    }

    private companion object {
        const val SLOW_ANALYSIS_MILLISECONDS = 500L
    }
}
