package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class AnalyseToolTest {
    @TempDir
    lateinit var workspace: File

    private val projectFolder get() = File(workspace, "shop")
    private val workingFolder get() = File(workspace, "cwd").apply { mkdirs() }
    private val output = ByteArrayOutputStream()

    @Test
    fun `should write one map with the metrics of every parser named after the folder into the current folder`() {
        // Arrange
        writeSource("src/App.kt", APP_SOURCE)

        // Act
        val exitCode = analyse(projectFolder.path)

        // Assert
        assertThat(exitCode).isZero()
        assertThat(filesOf(readMap(File(workingFolder, "shop.cc.json.gz"))).getValue("src/App.kt"))
            .containsKeys("indentation_level_1+", "complexity")
    }

    @Test
    fun `should add the git history to the files the parsers mapped`() {
        // Arrange
        writeSource("src/App.kt", APP_SOURCE)
        commitAll()

        // Act
        analyse(projectFolder.path, "--output-file=${mapFile.path}")

        // Assert
        assertThat(filesOf(readMap(mapFile)).getValue("src/App.kt")).containsKeys("complexity", "number_of_commits")
    }

    @Test
    fun `should keep the history of excluded files out of the map`() {
        // Arrange
        writeSource("src/App.kt", APP_SOURCE)
        writeSource("generated/Api.kt", APP_SOURCE)
        commitAll()

        // Act
        analyse(projectFolder.path, "--output-file=${mapFile.path}", "--exclude=generated")

        // Assert
        assertThat(filesOf(readMap(mapFile)).keys).containsExactly("src/App.kt")
    }

    @Test
    fun `should write the map and name why the git history is missing as the last line when the folder is inside a repository`() {
        // Arrange
        writeSource("module/src/App.kt", APP_SOURCE)
        commitAll()

        // Act
        val exitCode = analyse(File(projectFolder, "module").path, "--output-file=${mapFile.path}")

        // Assert
        assertThat(exitCode).isZero()
        assertThat(filesOf(readMap(mapFile)).getValue("src/App.kt")).doesNotContainKey("number_of_commits")
        assertThat(lastLine()).startsWith("No git history in the map:").contains("not at its root")
    }

    @Test
    fun `should add the svn history from the log of the working copy`() {
        // Arrange
        writeSource("src/App.kt", APP_SOURCE)
        File(projectFolder, ".svn").mkdirs()
        val svnLog = File(workspace, "svn.log").apply { writeText(SVN_LOG) }

        // Act
        analyse(projectFolder.path, "--output-file=${mapFile.path}", svnLogWriter = SvnLogWriter(listOf("cat", svnLog.path)))

        // Assert
        assertThat(filesOf(readMap(mapFile))).containsOnlyKeys("src/App.kt")
        assertThat(filesOf(readMap(mapFile)).getValue("src/App.kt")).containsKeys("complexity", "number_of_commits")
    }

    @Test
    fun `should write the map and name why the svn history is missing as the last line when svn cannot run`() {
        // Arrange
        writeSource("src/App.kt", APP_SOURCE)
        File(projectFolder, ".svn").mkdirs()

        // Act
        val exitCode = analyse(projectFolder.path, "--output-file=${mapFile.path}", svnLogWriter = SvnLogWriter(listOf(MISSING_COMMAND)))

        // Assert
        assertThat(exitCode).isZero()
        assertThat(mapFile).exists()
        assertThat(lastLine()).isEqualTo("No svn history in the map: the $MISSING_COMMAND command is not installed or not on the PATH")
    }

    @Test
    fun `should leave out the parsers and histories named by without`() {
        // Arrange
        writeSource("src/App.kt", APP_SOURCE)
        commitAll()

        // Act
        analyse(projectFolder.path, "--output-file=${mapFile.path}", "--without=unifiedparser,git")

        // Assert
        assertThat(filesOf(readMap(mapFile)).getValue("src/App.kt")).doesNotContainKeys("complexity", "number_of_commits")
    }

    @Test
    fun `should refuse a name for without that is neither a parser nor a history`() {
        // Arrange
        writeSource("src/App.kt", APP_SOURCE)

        // Act
        val exitCode = analyse(projectFolder.path, "--without=gitlab")

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(output.toString()).contains("--without does not know gitlab", "rawtextparser", "svn")
    }

    @Test
    fun `should fail when the folder does not exist`() {
        // Act
        val exitCode = analyse(File(workspace, "missing").path)

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(output.toString()).contains("does not exist")
    }

    private val mapFile get() = File(workspace, "out/map.cc.json.gz")

    private fun analyse(vararg arguments: String, svnLogWriter: SvnLogWriter = SvnLogWriter(listOf(MISSING_COMMAND))): Int {
        val tool = AnalyseTool(PrintStream(output), workingFolder, svnLogWriter) { listOf(RawTextParser(), UnifiedParser()) }
        return CommandLine(tool).execute("--quiet", *arguments)
    }

    private fun lastLine(): String = output.toString().trimEnd().lines().last()

    private fun readMap(file: File): Project = file.inputStream().use { ProjectDeserializer.deserializeProject(it) }

    private fun filesOf(project: Project): Map<String, Map<String, Any>> = project.rootNode.nodes
        .filter { (_, node) -> node.type == NodeType.File }
        .map { (path, node) -> path.edgesList.joinToString("/") to node.attributes }
        .toMap()

    private fun writeSource(path: String, content: String) {
        File(projectFolder, path).apply { parentFile.mkdirs() }.writeText(content)
    }

    private fun commitAll() {
        git("init", "--quiet")
        git("add", ".")
        git("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "--quiet", "-m", "initial")
    }

    private fun git(vararg arguments: String) {
        val process = ProcessBuilder(listOf("git") + arguments).directory(projectFolder).inheritIO().start()
        check(process.waitFor() == 0) { "git ${arguments.joinToString(" ")} failed" }
    }

    private companion object {
        const val MISSING_COMMAND = "codecharta-no-such-svn"
        const val APP_SOURCE = "package app\n\nfun main() {\n    if (true) println(1)\n}\n"
        val SVN_LOG =
            """
            ------------------------------------------------------------------------
            r2 | alice | 2024-01-08 10:00:00 +0100 (Mon, 08 Jan 2024) | 1 line
            Changed paths:
               M /trunk/src/App.kt
               A /trunk/src/Deleted.kt

            change
            ------------------------------------------------------------------------
            r1 | alice | 2024-01-01 10:00:00 +0100 (Mon, 01 Jan 2024) | 1 line
            Changed paths:
               A /trunk/src/App.kt

            initial
            ------------------------------------------------------------------------
            """.trimIndent() + "\n"
    }
}
