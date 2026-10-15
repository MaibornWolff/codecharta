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
                Violation(ViolationKind.FILE_CYCLE, Severity.ERROR, "Break the cycle.", members = listOf("a/Foo.kt", "b/Bar.kt")),
                Violation(ViolationKind.UNKNOWN_METRIC, Severity.WARNING, "No such metric.", metric = "lines_of_doc")
            ),
            filesChecked = 418
        )

    @Test
    fun `should print errors before warnings, grouped by rule with the message, worst file first`() {
        // Arrange
        val output = ByteArrayOutputStream()

        // Act
        ConsoleReport(PrintStream(output)).print(result)

        // Assert
        assertThat(output.toString()).isEqualTo(
            """
            ERROR  rloc > 400
                   Split it.
              src/Big.kt    812
              src/Small.kt  455

            ERROR  file cycle
                   Break the cycle.
              a/Foo.kt, b/Bar.kt

            WARN   rloc > 200
                   Plan a split.
              src/Mid.kt  263

            WARN   unknown metric: lines_of_doc
                   No such metric.

            3 errors, 2 warnings, 418 files checked

            """.trimIndent()
        )
    }

    @Test
    fun `should say so when nothing broke a rule`() {
        // Arrange
        val output = ByteArrayOutputStream()

        // Act
        ConsoleReport(PrintStream(output)).print(GateResult(emptyList(), filesChecked = 12))

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

    private fun metricViolation(
        severity: Severity,
        path: String,
        value: Double,
        threshold: Double,
        message: String
    ) = Violation(ViolationKind.METRIC, severity, message, path = path, metric = "rloc", value = value, threshold = threshold)
}
