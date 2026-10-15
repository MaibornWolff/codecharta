package de.maibornwolff.codecharta.analysers.tools.gate.analysis

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedProject
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
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
    fun `should name the analyser that failed`() {
        // Arrange
        writeSource("src/App.kt", "fun main() {}\n")

        // Act & Assert
        assertThatThrownBy {
            ProjectAnalyser().analyse(
                projectFolder,
                listOf(ConfiguredAnalyser(FailingAnalyser())),
                File(projectFolder, "out")
            )
        }.isInstanceOf(AnalysisException::class.java)
            .hasMessageContaining("failingparser")
    }

    @Test
    fun `should refuse to analyse with no analyser`() {
        // Arrange
        val analysers = emptyList<ConfiguredAnalyser>()

        // Act & Assert
        assertThatThrownBy { ProjectAnalyser().analyse(projectFolder, analysers, File(projectFolder, "out")) }
            .isInstanceOf(AnalysisException::class.java)
            .hasMessageContaining("No analyser")
    }

    private fun writeSource(path: String, content: String) {
        File(projectFolder, path).apply { parentFile.mkdirs() }.writeText(content)
    }

    @CommandLine.Command(name = "failingparser")
    private class FailingAnalyser : AnalyserInterface {
        override val name = "failingparser"
        override val description = "always fails"

        @CommandLine.Parameters
        private var arguments: List<String> = emptyList()

        override fun call(): Unit? = throw IllegalStateException("broken")

        override fun getDialog(): AnalyserDialogInterface = mockk()

        override fun isApplicable(resourceToBeParsed: String) = true
    }
}
