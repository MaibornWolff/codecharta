package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.dependency.DependencyParser
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.DomainLanguageParser
import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectSerializer
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
        val metrics = filesOf(project).getValue("src/App.kt")
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
        assertThat(filesOf(project).keys).containsExactly("src/App.kt")
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
        assertThat(filesOf(project).keys).containsExactly("src/checks/Kept.kt")
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
    fun `should name why an analyser ended with an error instead of a map`() {
        // Arrange
        writeSource("src/App.kt", "fun main() {}\n")
        val failingParser = UnifiedParser(fileMeasurer = { _, _ -> throw IllegalStateException("broken extractor") })

        // Act
        val failure = catchThrowable {
            ProjectAnalyser().analyse(projectFolder, listOf(ConfiguredAnalyser(failingParser)), File(projectFolder, "out"))
        }

        // Assert
        assertThat(failure).isInstanceOf(AnalysisException::class.java)
        assertThat(failure).hasMessageContaining("The analyser unifiedparser failed on").hasMessageContaining("No file could be analysed")
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
        assertThat(filesOf(parallel)).isEqualTo(filesOf(sequential))
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

    @Test
    fun `should stop at the first failed analyser when they run one after another`() {
        // Arrange
        writeSource("src/App.kt", "fun main() {}\n")
        val slowAnalyser = SlowAnalyser()
        val analysers = listOf(ConfiguredAnalyser(FailingAnalyser()), ConfiguredAnalyser(slowAnalyser))

        // Act
        val failure = catchThrowable { ProjectAnalyser().analyse(projectFolder, analysers, File(projectFolder, "out")) }

        // Assert
        assertThat(failure).isInstanceOf(AnalysisException::class.java).hasMessageContaining("failingparser")
        assertThat(slowAnalyser.hasFinished).isFalse()
    }

    @Test
    fun `should return a result for every analyser so one failure does not hide the other maps`() {
        // Arrange
        writeSource("src/App.kt", "fun main() {}\n")
        val analysers = listOf(ConfiguredAnalyser(FailingAnalyser()), ConfiguredAnalyser(UnifiedParser()))

        // Act
        val results = ProjectAnalyser().analyseEach(projectFolder, analysers, File(projectFolder, "out"))

        // Assert
        assertThat(results.first().exceptionOrNull()).isInstanceOf(AnalysisException::class.java).hasMessageContaining("failingparser")
        assertThat(filesOf(results.last().getOrThrow()).keys).containsExactly("src/App.kt")
    }

    @Test
    fun `should hand an analyser that does not read the project folder only its own arguments and the output file`() {
        // Arrange
        val recordingAnalyser = RecordingAnalyser()
        val analysers = listOf(ConfiguredAnalyser(recordingAnalyser, listOf("--repo-path", "repo"), readsProjectFolder = false))

        // Act
        ProjectAnalyser().analyseEach(projectFolder, analysers, File(projectFolder, "out"))

        // Assert
        assertThat(recordingAnalyser.arguments).containsExactly("--repo-path", "repo")
    }

    private fun bothAnalysers() = listOf(ConfiguredAnalyser(RawTextParser()), ConfiguredAnalyser(UnifiedParser()))

    private fun filesOf(project: Project): Map<String, Map<String, Any>> = project.rootNode.nodes
        .filter { (_, node) -> node.type == NodeType.File }
        .map { (path, node) -> path.edgesList.joinToString("/") to node.attributes }
        .toMap()

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

    @CommandLine.Command(name = "recordingparser")
    private class RecordingAnalyser : AnalyserInterface {
        override val name = "recordingparser"
        override val description = "records its arguments and writes an empty map"

        @CommandLine.Option(names = ["--output-file"])
        private var outputFile: String? = null

        @CommandLine.Unmatched
        var arguments: MutableList<String> = mutableListOf()

        override fun call(): Unit? {
            ProjectSerializer.serializeToFileOrStream(Project("recorded"), outputFile, System.out, true)
            return null
        }

        override fun getDialog(): AnalyserDialogInterface = mockk()

        override fun isApplicable(resourceToBeParsed: String) = true
    }

    private companion object {
        const val SLOW_ANALYSIS_MILLISECONDS = 500L
    }
}
