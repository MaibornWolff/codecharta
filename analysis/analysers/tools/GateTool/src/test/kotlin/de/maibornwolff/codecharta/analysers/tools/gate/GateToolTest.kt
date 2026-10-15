package de.maibornwolff.codecharta.analysers.tools.gate

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.dependency.DependencyParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class GateToolTest {
    @TempDir
    lateinit var projectFolder: File

    private val output = ByteArrayOutputStream()
    private val configFile get() = File(projectFolder, ".codecharta.yml")

    @BeforeEach
    fun writeProject() {
        writeSource(
            "src/main/kotlin/app/App.kt",
            "package app\n\nimport util.Util\n\nfun main() {\n    Util.help()\n    if (true) println(1)\n}\n"
        )
        writeSource("src/main/kotlin/util/Util.kt", "package util\n\nimport app.main\n\nobject Util {\n    fun help() = main()\n}\n")
    }

    @Test
    fun `should write a fully commented config on init`() {
        // Arrange & Act
        val exitCode = run("--init", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
        assertThat(configFile.readText()).contains("#   rloc:", "#   unifiedparser: on")
        assertThat(configFile.readLines().filter { it.isNotBlank() }).allMatch { it.startsWith("#") }
    }

    @Test
    fun `should refuse to overwrite an existing config without force`() {
        // Arrange
        configFile.writeText("output: mine\n")

        // Act
        val exitCode = run("--init", projectFolder.path)
        val forcedExitCode = run("--init", "--force", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(forcedExitCode).isEqualTo(0)
        assertThat(configFile.readText()).doesNotContain("output: mine")
    }

    @Test
    fun `should accept a valid config in doctor and say that no rule is active`() {
        // Arrange
        configFile.writeText("output: out\n")

        // Act
        val exitCode = run("--doctor", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
        assertThat(output.toString()).contains("is valid", "No rule is active yet")
    }

    @Test
    fun `should list every problem of an invalid config in doctor`() {
        // Arrange
        configFile.writeText("metrics:\n  rloc:\n    error:\n      max: lots\nexitCodes:\n  error: 2\n")

        // Act
        val exitCode = run("--doctor", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("2 problem(s)", "line 4: metrics.rloc.error.max", "line 6: exitCodes.error")
    }

    @Test
    fun `should fail with the tool failure code when there is no config to check against`() {
        // Arrange & Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("ccsh gate --init")
    }

    @Test
    fun `should report broken rules, write the map and the report and exit with the error code`() {
        // Arrange
        configFile.writeText(
            "metrics:\n  rloc:\n    error:\n      max: 1\n      message: Keep files tiny.\ncycles:\n  file:\n    severity: warning\n"
        )

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(
            output.toString()
        ).contains(
            "ERROR  rloc > 1",
            "Keep files tiny.",
            "src/main/kotlin/app/App.kt",
            "WARN   1 file cycle",
            "app/App.kt   → util/Util.kt"
        )
        val outputFolder = File(projectFolder, ".codecharta-gate-output")
        assertThat(File(outputFolder, "report.json").readText()).contains("\"exitCode\": 1")
        assertThat(File(outputFolder, "map.cc.json.gz")).exists()
    }

    @Test
    fun `should exit with the code the config maps to warnings`() {
        // Arrange
        configFile.writeText("exitCodes:\n  warning: 3\nmetrics:\n  rloc:\n    warning:\n      max: 1\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(3)
    }

    @Test
    fun `should pass when every file keeps to the rules`() {
        // Arrange
        configFile.writeText("metrics:\n  rloc:\n    error:\n      max: 1000\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
        assertThat(output.toString()).contains("No rule broken")
    }

    @Test
    fun `should not run an analyser the config switches off`() {
        // Arrange
        configFile.writeText("analysers:\n  dependencyparser: off\ncycles:\n  file:\n    severity: error\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
    }

    @Test
    fun `should refuse to check against an invalid config`() {
        // Arrange
        configFile.writeText("metrix: 1\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("line 1: unknown key 'metrix'")
    }

    @Test
    fun `should refuse to init and doctor in one run`() {
        // Arrange & Act
        val exitCode = run("--init", "--doctor", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("either --init or --doctor")
    }

    @Test
    fun `should refuse force without init`() {
        // Arrange
        configFile.writeText("output: out\n")

        // Act
        val exitCode = run("--force", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("--force only works with --init")
    }

    @Test
    fun `should name a project folder that does not exist`() {
        // Arrange
        val missingFolder = File(projectFolder, "init")

        // Act
        val exitCode = run(missingFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("The folder ${missingFolder.path} does not exist.")
    }

    @Test
    fun `should run without asking for arguments when the current folder has a config`() {
        // Arrange
        configFile.writeText("output: out\n")

        // Act
        val asksForArguments = GateTool(PrintStream(output), workingFolder = projectFolder).shouldAskForArguments()

        // Assert
        assertThat(asksForArguments).isFalse()
    }

    @Test
    fun `should ask for arguments when the current folder has no config`() {
        // Arrange
        val tool = GateTool(PrintStream(output), workingFolder = projectFolder)

        // Act
        val asksForArguments = tool.shouldAskForArguments()

        // Assert
        assertThat(asksForArguments).isTrue()
    }

    private fun run(vararg arguments: String): Int {
        val tool = GateTool(PrintStream(output), createAnalysers = { testAnalysers() })
        return CommandLine(tool).apply { executionStrategy = CommandLine.RunAll() }.execute(*arguments)
    }

    private fun testAnalysers(): List<AnalyserInterface> = listOf(UnifiedParser(), DependencyParser())

    private fun writeSource(path: String, content: String) {
        File(projectFolder, path).apply { parentFile.mkdirs() }.writeText(content)
    }
}
