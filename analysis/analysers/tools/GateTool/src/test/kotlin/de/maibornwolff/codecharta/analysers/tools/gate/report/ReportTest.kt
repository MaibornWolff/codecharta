package de.maibornwolff.codecharta.analysers.tools.gate.report

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Declaration
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.ViolationKind
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class ReportTest {
    private val result =
        GateResult(
            listOf(
                metricViolation(Severity.WARNING, "src/Mid.kt", 263.0, 200.0, "Plan a split."),
                metricViolation(Severity.ERROR, "src/Small.kt", 455.0, 400.0, "Split it."),
                metricViolation(Severity.ERROR, "src/Big.kt", 812.0, 400.0, "Split it."),
                Violation(
                    ViolationKind.CYCLE_BETWEEN_FILES,
                    Severity.ERROR,
                    "Break the cycle.",
                    members = listOf("a/Foo.kt", "b/Bar.kt"),
                    declarations = listOf(Declaration("a/Foo.kt", "Foo"), Declaration("b/Bar.kt", "Bar"))
                ),
                Violation(ViolationKind.UNKNOWN_METRIC, Severity.WARNING, "No such metric.", metric = "lines_of_doc"),
                upward("src/a/One.kt", "one", "src/b/Two.kt", "Two")
            ),
            filesChecked = 418
        )

    @Test
    fun `should print the rules in the order of the config, errors before warnings within a rule, worst file first`() {
        // Arrange
        val output = ByteArrayOutputStream()

        // Act
        ConsoleReport(PrintStream(output), listOf("rloc", "lines_of_doc")).print(result)

        // Assert
        assertThat(output.toString()).isEqualTo(
            """
            ERROR  rloc > 400
                   Instruction: Split it.
              src/Big.kt    812
              src/Small.kt  455

            WARN   rloc > 200
                   Instruction: Plan a split.
              src/Mid.kt  263

            WARN   unknown metric: lines_of_doc
                   Instruction: No such metric.

            ERROR  1 cycle between files
                   Instruction: Break the cycle.
              cycle 1 of 1, 2 files
                a/Foo.kt: Foo → b/Bar.kt: Bar
                b/Bar.kt: Bar → a/Foo.kt: Foo

            WARN   1 upward dependency
              in src/
                a/One.kt: one → b/Two.kt: Two

            3 errors, 3 warnings, 418 files checked

            """.trimIndent()
        )
    }

    @Test
    fun `should follow the metric order of the config rather than the severity`() {
        // Arrange
        val output = ByteArrayOutputStream()
        val violations =
            listOf(
                metricViolation(Severity.ERROR, "src/Big.kt", 812.0, 400.0, "Split it."),
                Violation(ViolationKind.METRIC, Severity.WARNING, null, path = "src/Big.kt", metric = "mcc", value = 30.0, threshold = 20.0)
            )

        // Act
        ConsoleReport(PrintStream(output), listOf("mcc", "rloc")).print(GateResult(violations, filesChecked = 1))

        // Assert
        assertThat(output.toString()).startsWith("WARN   mcc > 20\n  src/Big.kt  30\n\nERROR  rloc > 400\n")
    }

    @Test
    fun `should walk each cycle through its declarations and show the upward dependencies by the folder they cross`() {
        // Arrange
        val output = ByteArrayOutputStream()
        val folder = "src/main/model"
        val node = Declaration("$folder/Node.kt", "Node")
        val mutableNode = Declaration("$folder/MutableNode.kt", "MutableNode")
        val inserter = Declaration("$folder/sub/Inserter.kt", "Inserter")
        val parse = Declaration("lib/Parser.kt", "parse")
        val parseBlock = Declaration("lib/Parser.kt", "parseBlock")
        val cycles =
            listOf(
                Violation(
                    ViolationKind.CYCLE_BETWEEN_FILES,
                    Severity.ERROR,
                    null,
                    members = listOf(mutableNode.file, node.file, inserter.file),
                    declarations = listOf(mutableNode, inserter, node)
                ),
                Violation(
                    ViolationKind.CYCLE_INSIDE_FILE,
                    Severity.ERROR,
                    null,
                    path = parse.file,
                    members = listOf(parse.file),
                    declarations = listOf(parse, parseBlock)
                ),
                upward("src/a/One.kt", "one", "src/b/Two.kt", "Two"),
                upward("src/a/deep/Three.kt", "three", "src/c/Four.kt", "Four"),
                upward("Main.kt", "main", "lib/Util.kt", "Util")
            )

        // Act
        ConsoleReport(PrintStream(output), emptyList()).print(GateResult(cycles, filesChecked = 3))

        // Assert
        assertThat(output.toString()).isEqualTo(
            """
            ERROR  1 cycle between files
              cycle 1 of 1, 3 files in src/main/model/
                MutableNode.kt: MutableNode → sub/Inserter.kt: Inserter
                sub/Inserter.kt: Inserter   → Node.kt: Node
                Node.kt: Node               → MutableNode.kt: MutableNode

            ERROR  1 cycle inside a file
              cycle 1 of 1 in lib/Parser.kt
                parse      → parseBlock
                parseBlock → parse

            WARN   3 upward dependencies
              in ./
                Main.kt: main → lib/Util.kt: Util
              in src/
                a/One.kt: one          → b/Two.kt: Two
                a/deep/Three.kt: three → c/Four.kt: Four

            2 errors, 3 warnings, 3 files checked

            """.trimIndent()
        )
    }

    @Test
    fun `should say so when nothing broke a rule`() {
        // Arrange
        val output = ByteArrayOutputStream()

        // Act
        ConsoleReport(PrintStream(output), emptyList()).print(GateResult(emptyList(), filesChecked = 12))

        // Assert
        assertThat(output.toString()).isEqualTo("No rule broken, 12 files checked\n")
    }

    @Test
    fun `should write the summary, exit code and every violation as json`() {
        // Arrange
        val config = GateConfig()

        // Act
        val json = JsonParser.parseString(JsonReport.render(result, config)).asJsonObject

        // Assert
        assertThat(json["exitCode"].asInt).isEqualTo(1)
        assertThat(json["summary"].toString()).isEqualTo("""{"error":3,"warning":3,"files":418}""")
        val violations = json["violations"].asJsonArray.map { it.toString() }
        assertThat(violations).contains(
            """{"rule":"metric","severity":"error","path":"src/Big.kt","metric":"rloc","value":812,"threshold":400,"instruction":"Split it."}""",
            """{"rule":"cycle-between-files","severity":"error","members":["a/Foo.kt","b/Bar.kt"],""" +
                """"declarations":[{"file":"a/Foo.kt","name":"Foo"},{"file":"b/Bar.kt","name":"Bar"}],"instruction":"Break the cycle."}""",
            """{"rule":"upward-dependency","severity":"warning","path":"src/a/One.kt","target":"src/b/Two.kt",""" +
                """"declarations":[{"file":"src/a/One.kt","name":"one"},{"file":"src/b/Two.kt","name":"Two"}]}""",
            """{"rule":"unknown-metric","severity":"warning","metric":"lines_of_doc","instruction":"No such metric."}"""
        )
    }

    @Test
    fun `should end the json report with a line break`() {
        // Arrange
        val config = GateConfig()

        // Act
        val json = JsonReport.render(result, config)

        // Assert
        assertThat(json).endsWith("}\n")
    }

    private fun upward(fromFile: String, fromName: String, toFile: String, toName: String) = Violation(
        ViolationKind.UPWARD_DEPENDENCY,
        Severity.WARNING,
        null,
        path = fromFile,
        target = toFile,
        declarations = listOf(Declaration(fromFile, fromName), Declaration(toFile, toName))
    )

    private fun metricViolation(
        severity: Severity,
        path: String,
        value: Double,
        threshold: Double,
        instruction: String
    ) = Violation(ViolationKind.METRIC, severity, instruction, path = path, metric = "rloc", value = value, threshold = threshold)
}
