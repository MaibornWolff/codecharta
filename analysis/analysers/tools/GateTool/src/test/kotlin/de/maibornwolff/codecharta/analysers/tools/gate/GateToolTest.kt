package de.maibornwolff.codecharta.analysers.tools.gate

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.dependency.DependencyParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileNotFoundException
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
    fun `should label itself experimental wherever ccsh lists it`() {
        // Act
        val description = GateTool().getAnalyserDescription()

        // Assert
        assertThat(description).startsWith("[experimental]")
    }

    @Test
    fun `should write a config on init that runs the analysers but checks no rule yet`() {
        // Act
        val exitCode = run("--init", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
        val config = configFile.readText()
        assertThat(config).contains("\n  unifiedparser: on\n", "\nparallel: on\n", "\n# metrics:\n", "\n# dependencies:")
        assertThat(config).doesNotContain("\nmetrics:", "\ndependencies:", "\noverrides:")
    }

    @Test
    fun `should refuse to overwrite an existing config without force`() {
        // Arrange
        configFile.writeText("output: mine\n")

        // Act
        val exitCode = run("--init", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(configFile.readText()).isEqualTo("output: mine\n")
    }

    @Test
    fun `should overwrite an existing config with force`() {
        // Arrange
        writeConfig("output: mine\n")

        // Act
        val exitCode = run("--init", "--force", projectFolder.path)

        // Assert
        assertThat(exitCode).isZero()
        assertThat(configFile.readText()).doesNotContain("output: mine")
    }

    @Test
    fun `should accept a valid config in doctor and say that no rule is active`() {
        // Arrange
        writeConfig("output: out\n")

        // Act
        val exitCode = run("--doctor", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
        assertThat(output.toString()).contains("is valid", "No rule is active yet")
    }

    @Test
    fun `should list every problem of an invalid config in doctor`() {
        // Arrange
        writeConfig("metrics:\n  rloc:\n    error:\n      max: lots\nexitCodes:\n  error: 2\n")

        // Act
        val exitCode = run("--doctor", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("2 problem(s)", "line 4: metrics.rloc.error.max", "line 6: exitCodes.error")
    }

    @Test
    fun `should fail with the tool failure code when there is no config to check against`() {
        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("ccsh gate --init")
    }

    @Test
    fun `should report broken rules, write the map and the report and exit with the error code`() {
        // Arrange
        writeConfig(
            "metrics:\n  rloc:\n    error:\n      max: 1\n      instruction: Keep files tiny.\ndependencies:\n  cyclesBetweenFiles:\n    severity: warning\n"
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
            "WARN   1 cycle between files",
            "app/App.kt: main   → util/Util.kt: Util"
        )
        val outputFolder = File(projectFolder, ".codecharta-gate-output")
        assertThat(File(outputFolder, "report.json").readText()).contains("\"exitCode\": 1")
        assertThat(File(outputFolder, "map.cc.json.gz")).exists()
    }

    @Test
    fun `should exit with the code the config maps to warnings`() {
        // Arrange
        writeConfig("exitCodes:\n  warning: 3\nmetrics:\n  rloc:\n    warning:\n      max: 1\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(3)
    }

    @Test
    fun `should pass when every file keeps to the rules`() {
        // Arrange
        writeConfig("metrics:\n  rloc:\n    error:\n      max: 1000\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
        assertThat(output.toString()).contains("No rule broken")
    }

    @Test
    fun `should not run an analyser the config switches off`() {
        // Arrange
        writeConfig("analysers:\n  unifiedparser: on\n  dependencyparser: off\ndependencies:\n  cyclesBetweenFiles:\n    severity: error\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
    }

    @Test
    fun `should refuse to check against an invalid config`() {
        // Arrange
        writeConfig("metrix: 1\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("line 1: unknown key 'metrix'")
    }

    @Test
    fun `should refuse to init and doctor in one run`() {
        // Act
        val exitCode = run("--init", "--doctor", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("either --init or --doctor")
    }

    @Test
    fun `should refuse options that do nothing when only validating the config`() {
        // Arrange
        writeConfig("output: out\n")

        // Act
        val exitCode = run("--doctor", "--parallel", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("--map and --parallel do nothing with --doctor")
    }

    @Test
    fun `should refuse force without init`() {
        // Arrange
        writeConfig("output: out\n")

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
        writeConfig("output: out\n")

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

    @Test
    fun `should mark the end of the analysis before the result`() {
        // Arrange
        writeConfig("metrics:\n  rloc:\n    error:\n      max: 1\n")

        // Act
        run(projectFolder.path)

        // Assert
        val printed = output.toString()
        assertThat(printed).contains("Analysis done: 2 files with unifiedparser, dependencyparser in ")
        assertThat(printed.indexOf("Analysis done")).isLessThan(printed.indexOf("ERROR  rloc > 1"))
    }

    @Test
    fun `should tell where the map of the analysis was written, last, below the report`() {
        // Arrange
        writeConfig("output: out\n")
        val outputFolder = File(projectFolder, "out")

        // Act
        run(projectFolder.path)

        // Assert
        val mapFile = File(outputFolder, "map.cc.json.gz")
        assertThat(output.toString()).endsWith("Report: ${File(outputFolder, "report.json").path}\nMap: ${mapFile.path}\n")
        assertThat(mapFile).exists()
    }

    @Test
    fun `should keep the output of the analysers off the console when quiet`() {
        // Arrange
        writeConfig("metrics:\n  rloc:\n    error:\n      max: 1\n")
        val analyserOutput = ByteArrayOutputStream()

        // Act
        val exitCode = withSystemOut(analyserOutput) { run("--quiet", projectFolder.path) }

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(analyserOutput.toString()).doesNotContain("Checking if UnifiedParser is applicable")
        assertThat(output.toString()).contains("Analysing ${projectFolder.path} with unifiedparser, dependencyparser", "ERROR  rloc > 1")
    }

    @Test
    fun `should name why an analyser could analyse no file when quiet`() {
        // Arrange
        writeConfig("$ANALYSERS_SECTION\n  unifiedparser: on\n")
        val unreadable = UnifiedParser(fileMeasurer = { file, _ -> throw FileNotFoundException("${'$'}{file.name} (Permission denied)") })
        val tool = GateTool(PrintStream(output), createAnalysers = { listOf(unreadable) })

        // Act
        val exitCode = withSystemOut(ByteArrayOutputStream()) {
            CommandLine(tool).apply { executionStrategy = CommandLine.RunAll() }.execute("--quiet", projectFolder.path)
        }

        // Assert
        assertThat(exitCode).isNotZero()
        assertThat(output.toString()).contains("No file could be analysed: all 2 failed").contains("FileNotFoundException")
    }

    @Test
    fun `should leave the output of the analysers on the console when not quiet`() {
        // Arrange
        writeConfig("output: out\n")
        val analyserOutput = ByteArrayOutputStream()

        // Act
        withSystemOut(analyserOutput) { run(projectFolder.path) }

        // Assert
        assertThat(analyserOutput.toString()).contains("Checking if UnifiedParser is applicable")
    }

    @Test
    fun `should analyse the input folder the config names, relative to the project folder`() {
        // Arrange
        writeConfig("input: src/main/kotlin/app\nmetrics:\n  rloc:\n    error:\n      max: 1\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(output.toString()).contains("  App.kt  6", "1 error, 0 warnings, 1 file checked")
        assertThat(output.toString()).doesNotContain("Util.kt")
        assertThat(File(projectFolder, ".codecharta-gate-output/report.json")).exists()
    }

    @Test
    fun `should pass the options the config gives an analyser`() {
        // Arrange
        writeConfig("analysers:\n  unifiedparser:\n    exclude:\n      - util\nmetrics:\n  rloc:\n    error:\n      max: 1\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(output.toString()).contains("src/main/kotlin/app/App.kt").doesNotContain("src/main/kotlin/util/Util.kt  ")
    }

    @Test
    fun `should report an option an analyser does not have in doctor`() {
        // Arrange
        writeConfig("analysers:\n  unifiedparser:\n    output-file: elsewhere.cc.json\n")

        // Act
        val exitCode = run("--doctor", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("line 3: unifiedparser has no option 'output-file'")
    }

    @Test
    fun `should report the same result when the analysers run in parallel`() {
        // Arrange
        writeConfig("metrics:\n  rloc:\n    error:\n      max: 1\ndependencies:\n  cyclesBetweenFiles:\n    severity: warning\n")

        // Act
        val exitCode = run("--parallel", projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(output.toString()).contains("2 errors, 1 warning, 2 files checked")
    }

    @Test
    fun `should check an existing map instead of analysing the project`() {
        // Arrange
        val mapFile = writeMap(Node("Only.kt", NodeType.File, mapOf("rloc" to 50)))
        writeConfig("metrics:\n  rloc:\n    error:\n      max: 10\n")

        // Act
        val exitCode = run("--map", mapFile.path, projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(output.toString()).contains("Map read: 1 file from ${mapFile.path}", "  Only.kt  50")
        assertThat(output.toString()).doesNotContain("App.kt", "Analysis done")
    }

    @Test
    fun `should warn that dependencies could not be checked when the map has no dependency analysis`() {
        // Arrange
        val mapFile = writeMap(Node("Only.kt", NodeType.File, mapOf("rloc" to 50)))
        writeConfig("dependencies:\n  cyclesBetweenFiles:\n    severity: error\n")

        // Act
        val exitCode = run("--map", mapFile.path, projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
        assertThat(output.toString()).contains("WARN   dependencies not checked", "0 errors, 1 warning")
    }

    @Test
    fun `should write the config from the metrics of an existing map`() {
        // Arrange
        val mapFile = writeMap(Node("Only.kt", NodeType.File, mapOf("coverage" to 80)))

        // Act
        val exitCode = run("--init", "--map", mapFile.path, projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(0)
        assertThat(configFile.readText()).contains("##   coverage  80 – 80", "#   coverage:").doesNotContain("rloc")
    }

    @Test
    fun `should fail with the tool failure code when the map does not exist`() {
        // Arrange
        writeConfig("output: out\n")

        // Act
        val exitCode = run("--map", File(projectFolder, "missing.cc.json").path, projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("missing.cc.json does not exist")
    }

    @Test
    fun `should resolve the paths of a config kept elsewhere against the project folder`() {
        // Arrange
        val configElsewhere = File(projectFolder.parentFile, "${projectFolder.name}-ci/gate.yml").apply { parentFile.mkdirs() }
        configElsewhere.writeText(
            "input: src/main/kotlin/app\nmetrics:\n  rloc:\n    error:\n      max: 1\nanalysers:\n  unifiedparser: on\n"
        )

        // Act
        val exitCode = run("--config", configElsewhere.path, projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(output.toString()).contains("  App.kt  6")
        assertThat(File(projectFolder, ".codecharta-gate-output/report.json")).exists()
        assertThat(File(configElsewhere.parentFile, ".codecharta-gate-output")).doesNotExist()
    }

    @Test
    fun `should not require the input folder when checking an existing map`() {
        // Arrange
        val mapFile = writeMap(Node("Only.kt", NodeType.File, mapOf("rloc" to 50)))
        writeConfig("input: not/there\nmetrics:\n  rloc:\n    error:\n      max: 10\n")

        // Act
        val exitCode = run("--map", mapFile.path, projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(1)
    }

    @Test
    fun `should leave the files the config excludes out of every check`() {
        // Arrange
        writeConfig(
            "exclude:\n  - util/\nmetrics:\n  rloc:\n    error:\n      max: 1\ndependencies:\n  cyclesBetweenFiles:\n    severity: error\n"
        )

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(1)
        assertThat(output.toString()).contains("1 error, 0 warnings, 1 file checked").doesNotContain("Util.kt", "cycle")
    }

    @Test
    fun `should suggest keeping the output folder out of version control after init`() {
        // Arrange
        File(projectFolder, ".gitignore").writeText("build/\n")

        // Act
        run("--init", projectFolder.path)

        // Assert
        assertThat(output.toString()).contains("Add .codecharta-gate-output/ to ")
    }

    @Test
    fun `should warn about an override pattern that matches no file`() {
        // Arrange
        writeConfig("overrides:\n  - paths:\n      - ./src/**\n    metrics:\n      rloc: off\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isZero()
        assertThat(output.toString()).contains("WARN   1 pattern that matches no file", "overrides[0].paths  ./src/**")
    }

    @Test
    fun `should refuse to analyse when the config switches on no analyser`() {
        // Arrange
        configFile.writeText("metrics:\n  rloc:\n    error:\n      max: 1\n")

        // Act
        val exitCode = run(projectFolder.path)

        // Assert
        assertThat(exitCode).isEqualTo(2)
        assertThat(output.toString()).contains("No analyser is switched on")
    }

    private fun writeConfig(text: String) {
        val analysers = if (ANALYSERS_SECTION in text) "" else "$ANALYSERS_SECTION\n  unifiedparser: on\n  dependencyparser: on\n"
        configFile.writeText(text + analysers)
    }

    private fun writeMap(vararg files: Node): File {
        val project = Project("given", listOf(Node("root", NodeType.Folder, children = files.toSet())))
        val mapFile = File(projectFolder, "given.cc.json")
        ProjectSerializer.serializeToFileOrStream(project, mapFile.path, System.out, false)
        return mapFile
    }

    private fun <T> withSystemOut(stream: ByteArrayOutputStream, action: () -> T): T {
        val originalOut = System.out
        System.setOut(PrintStream(stream))
        try {
            return action()
        } finally {
            System.setOut(originalOut)
        }
    }

    private fun run(vararg arguments: String): Int {
        val tool = GateTool(PrintStream(output), createAnalysers = { testAnalysers() })
        return CommandLine(tool).apply { executionStrategy = CommandLine.RunAll() }.execute(*arguments)
    }

    private fun testAnalysers(): List<AnalyserInterface> = listOf(UnifiedParser(), DependencyParser())

    private fun writeSource(path: String, content: String) {
        File(projectFolder, path).apply { parentFile.mkdirs() }.writeText(content)
    }

    private companion object {
        const val ANALYSERS_SECTION = "analysers:"
    }
}
