package de.maibornwolff.codecharta.analysers.tools.gate.report

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
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
                    ViolationKind.FILE_CYCLE,
                    Severity.ERROR,
                    "Break the cycle.",
                    members = listOf("a/Foo.kt", "b/Bar.kt"),
                    dependencies = mapOf("a/Foo.kt" to listOf("b/Bar.kt"), "b/Bar.kt" to listOf("a/Foo.kt"))
                ),
                Violation(ViolationKind.UNKNOWN_METRIC, Severity.WARNING, "No such metric.", metric = "lines_of_doc")
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
                   Split it.
              src/Big.kt    812
              src/Small.kt  455

            WARN   rloc > 200
                   Plan a split.
              src/Mid.kt  263

            WARN   unknown metric: lines_of_doc
                   No such metric.

            ERROR  1 file cycle
                   Break the cycle.
              cycle 1 of 1, 2 files
                a/Foo.kt → b/Bar.kt
                b/Bar.kt → a/Foo.kt

            3 errors, 2 warnings, 418 files checked

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
    fun `should show each cycle with the folder its members share and what each member depends on`() {
        // Arrange
        val output = ByteArrayOutputStream()
        val folder = "src/main/model"
        val cycles =
            listOf(
                Violation(
                    ViolationKind.FILE_CYCLE,
                    Severity.ERROR,
                    null,
                    members = listOf("$folder/MutableNode.kt", "$folder/Node.kt", "$folder/sub/Inserter.kt"),
                    dependencies =
                        mapOf(
                            "$folder/MutableNode.kt" to listOf("$folder/Node.kt", "$folder/sub/Inserter.kt"),
                            "$folder/Node.kt" to listOf("$folder/MutableNode.kt"),
                            "$folder/sub/Inserter.kt" to listOf("$folder/MutableNode.kt")
                        )
                ),
                Violation(
                    ViolationKind.PACKAGE_CYCLE,
                    Severity.WARNING,
                    null,
                    members = listOf("a", "b"),
                    dependencies = mapOf("a" to listOf("b"), "b" to listOf("a"))
                )
            )

        // Act
        ConsoleReport(PrintStream(output), emptyList()).print(GateResult(cycles, filesChecked = 3))

        // Assert
        assertThat(output.toString()).isEqualTo(
            """
            ERROR  1 file cycle
              cycle 1 of 1, 3 files in src/main/model/
                MutableNode.kt  → Node.kt, sub/Inserter.kt
                Node.kt         → MutableNode.kt
                sub/Inserter.kt → MutableNode.kt

            WARN   1 package cycle
              cycle 1 of 1, 2 packages
                a → b
                b → a

            1 error, 1 warning, 3 files checked

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
        assertThat(json["summary"].toString()).isEqualTo("""{"error":3,"warning":2,"files":418}""")
        val violations = json["violations"].asJsonArray.map { it.toString() }
        assertThat(violations).contains(
            """{"rule":"metric","severity":"error","path":"src/Big.kt","metric":"rloc","value":812,"threshold":400,"message":"Split it."}""",
            """{"rule":"file-cycle","severity":"error","members":["a/Foo.kt","b/Bar.kt"],"message":"Break the cycle."}""",
            """{"rule":"unknown-metric","severity":"warning","metric":"lines_of_doc","message":"No such metric."}"""
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

    private fun metricViolation(
        severity: Severity,
        path: String,
        value: Double,
        threshold: Double,
        message: String
    ) = Violation(ViolationKind.METRIC, severity, message, path = path, metric = "rloc", value = value, threshold = threshold)
}
