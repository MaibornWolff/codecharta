package de.maibornwolff.codecharta.analysers.tools.gate.report

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Bound
import de.maibornwolff.codecharta.analysers.tools.gate.rules.CycleViolation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Declaration
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Limit
import de.maibornwolff.codecharta.analysers.tools.gate.rules.MetricViolation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.UnknownMetric
import de.maibornwolff.codecharta.analysers.tools.gate.rules.UnmatchedPattern
import de.maibornwolff.codecharta.analysers.tools.gate.rules.UpwardViolation
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
                CycleViolation(Severity.ERROR, "Break the cycle.", listOf(Declaration("a/Foo.kt", "Foo"), Declaration("b/Bar.kt", "Bar"))),
                UnknownMetric(Severity.WARNING, "No such metric.", "lines_of_doc"),
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
            ┌ Instruction ──
            │ Split it.
            └───────────────
              src/Big.kt    812
              src/Small.kt  455

            WARN   rloc > 200
            ┌ Instruction ──
            │ Plan a split.
            └───────────────
              src/Mid.kt  263

            WARN   unknown metric: lines_of_doc
            ┌ Instruction ───
            │ No such metric.
            └────────────────

            ERROR  1 cycle between files
            ┌ Instruction ────
            │ Break the cycle.
            └─────────────────
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
                MetricViolation(Severity.WARNING, null, "src/Big.kt", "mcc", 30.0, Limit(Bound.MAX, 20.0))
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
                CycleViolation(Severity.ERROR, null, listOf(mutableNode, inserter, node)),
                CycleViolation(Severity.ERROR, null, listOf(parse, parseBlock)),
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
    fun `should wrap a long instruction inside its box and keep the line breaks it was written with`() {
        // Arrange
        val output = ByteArrayOutputStream()
        val instruction =
            "Split the file by responsibility into smaller files, so that each of them has one reason to change " +
                "and stays easy to read.\nAsk before splitting generated code."
        val violation =
            MetricViolation(Severity.ERROR, instruction, "src/Big.kt", "rloc", 812.0, Limit(Bound.MAX, 400.0))

        // Act
        ConsoleReport(PrintStream(output), listOf("rloc")).print(GateResult(listOf(violation), filesChecked = 1))

        // Assert
        assertThat(output.toString()).startsWith(
            """
            ERROR  rloc > 400
            ┌ Instruction ─────────────────────────────────────────────────────────────
            │ Split the file by responsibility into smaller files, so that each of them
            │ has one reason to change and stays easy to read.
            │ Ask before splitting generated code.
            └──────────────────────────────────────────────────────────────────────────
              src/Big.kt  812
            """.trimIndent()
        )
    }

    @Test
    fun `should show a minimum the files fall below, the lowest value first`() {
        // Arrange
        val output = ByteArrayOutputStream()
        val belowMinimum = {
            path: String,
            value: Double
            ->
            MetricViolation(Severity.ERROR, null, path, "coverage", value, Limit(Bound.MIN, 80.0))
        }

        // Act
        ConsoleReport(
            PrintStream(output),
            listOf("coverage")
        ).print(GateResult(listOf(belowMinimum("src/A.kt", 70.0), belowMinimum("src/B.kt", 20.0)), filesChecked = 2))

        // Assert
        assertThat(output.toString()).startsWith("ERROR  coverage < 80\n  src/B.kt  20\n  src/A.kt  70\n")
    }

    @Test
    fun `should write the minimum a file falls below into the json report`() {
        // Arrange
        val result =
            GateResult(
                listOf(MetricViolation(Severity.ERROR, null, "src/A.kt", "coverage", 70.0, Limit(Bound.MIN, 80.0))),
                filesChecked = 1
            )

        // Act
        val json = JsonParser.parseString(JsonReport.render(result, GateConfig())).asJsonObject

        // Assert
        assertThat(json["violations"].asJsonArray.single().toString()).isEqualTo(
            """{"rule":"metric","severity":"error","path":"src/A.kt","metric":"coverage","value":70,"min":80}"""
        )
    }

    @Test
    fun `should list the patterns that match no file with the setting they are in`() {
        // Arrange
        val output = ByteArrayOutputStream()
        val unmatched =
            listOf(
                UnmatchedPattern(Severity.WARNING, "Check the patterns.", "./src/**", "exclude"),
                UnmatchedPattern(Severity.WARNING, "Check the patterns.", "legacy/", "overrides[0].paths")
            )

        // Act
        ConsoleReport(PrintStream(output), emptyList()).print(GateResult(unmatched, filesChecked = 2))
        val json = JsonParser.parseString(JsonReport.render(GateResult(unmatched.take(1), filesChecked = 2), GateConfig())).asJsonObject

        // Assert
        assertThat(output.toString()).startsWith(
            "WARN   2 patterns that match no file\n┌ Instruction ───────\n│ Check the patterns.\n└────────────────────\n" +
                "  exclude             ./src/**\n  overrides[0].paths  legacy/\n"
        )
        assertThat(json["violations"].asJsonArray.single().toString()).isEqualTo(
            """{"rule":"unmatched-pattern","severity":"warning","setting":"exclude","pattern":"./src/**","instruction":"Check the patterns."}"""
        )
    }

    @Test
    fun `should keep the indentation of a line when wrapping it inside the box`() {
        // Arrange
        val output = ByteArrayOutputStream()
        val instruction = "Split the file:\n  - move the parsing of every supported language into a parser of its own, one file per language"
        val violation = MetricViolation(Severity.ERROR, instruction, "src/Big.kt", "rloc", 812.0, Limit(Bound.MAX, 400.0))

        // Act
        ConsoleReport(PrintStream(output), listOf("rloc")).print(GateResult(listOf(violation), filesChecked = 1))

        // Assert
        assertThat(output.toString()).contains(
            "│   - move the parsing of every supported language into a parser of its own,\n│   one file per language\n"
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
            """{"rule":"metric","severity":"error","path":"src/Big.kt","metric":"rloc","value":812,"max":400,"instruction":"Split it."}""",
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

    private fun upward(fromFile: String, fromName: String, toFile: String, toName: String) =
        UpwardViolation(Severity.WARNING, null, Declaration(fromFile, fromName), Declaration(toFile, toName))

    private fun metricViolation(
        severity: Severity,
        path: String,
        value: Double,
        threshold: Double,
        instruction: String
    ) = MetricViolation(severity, instruction, path, "rloc", value, Limit(Bound.MAX, threshold))
}
