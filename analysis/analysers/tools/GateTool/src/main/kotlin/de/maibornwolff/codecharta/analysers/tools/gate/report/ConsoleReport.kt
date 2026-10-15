package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.toDisplayText
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.ViolationKind
import java.io.PrintStream

class ConsoleReport(private val output: PrintStream, private val metricOrder: List<String>) {
    fun print(result: GateResult) {
        if (result.violations.isEmpty()) {
            output.println("No rule broken, ${counted(result.filesChecked, "file")} checked")
            return
        }
        groupsInConfigOrder(result.violations).forEach { group ->
            printGroup(group)
            output.println()
        }
        output.println(summary(result))
    }

    private fun groupsInConfigOrder(violations: List<Violation>): List<List<Violation>> = violations
        .groupBy { listOf(it.severity, it.kind, it.metric, it.threshold, it.instruction) }
        .values
        .sortedWith(
            compareBy<List<Violation>> { sectionOf(it.first()) }
                .thenBy { it.first().kind }
                .thenByDescending { it.first().severity }
                .thenByDescending { it.first().threshold }
        )

    private fun sectionOf(violation: Violation): Int = when (violation.kind) {
        ViolationKind.METRIC, ViolationKind.UNKNOWN_METRIC -> metricOrder.indexOf(violation.metric).takeIf { it >= 0 } ?: metricOrder.size
        ViolationKind.FILE_CYCLE -> metricOrder.size + 1
        ViolationKind.PACKAGE_CYCLE -> metricOrder.size + 2
        ViolationKind.CYCLES_NOT_CHECKED -> metricOrder.size + 3
    }

    private fun printGroup(group: List<Violation>) {
        val first = group.first()
        output.println(SEVERITY_LABELS.getValue(first.severity).padEnd(LABEL_WIDTH) + title(group))
        first.instruction?.let { output.println(" ".repeat(LABEL_WIDTH) + INSTRUCTION_LABEL + it) }
        when (first.kind) {
            ViolationKind.METRIC -> printMetricValues(group)
            ViolationKind.FILE_CYCLE -> CycleText("file").lines(group).forEach(output::println)
            ViolationKind.PACKAGE_CYCLE -> CycleText("package").lines(group).forEach(output::println)
            ViolationKind.CYCLES_NOT_CHECKED -> Unit
            ViolationKind.UNKNOWN_METRIC -> Unit
        }
    }

    private fun title(group: List<Violation>): String {
        val first = group.first()
        return when (first.kind) {
            ViolationKind.METRIC -> "${first.metric} > ${first.threshold!!.toDisplayText()}"
            ViolationKind.FILE_CYCLE -> counted(group.size, "file cycle")
            ViolationKind.PACKAGE_CYCLE -> counted(group.size, "package cycle")
            ViolationKind.UNKNOWN_METRIC -> "unknown metric: ${first.metric}"
            ViolationKind.CYCLES_NOT_CHECKED -> "cycles not checked"
        }
    }

    private fun printMetricValues(group: List<Violation>) {
        val pathWidth = group.maxOf { it.path!!.length }
        group.sortedByDescending { it.value }.forEach {
            output.println(INDENT + it.path!!.padEnd(pathWidth) + INDENT + it.value!!.toDisplayText())
        }
    }

    private fun summary(result: GateResult): String {
        val errors = counted(result.count(Severity.ERROR), "error")
        val warnings = counted(result.count(Severity.WARNING), "warning")
        return "$errors, $warnings, ${counted(result.filesChecked, "file")} checked"
    }

    companion object {
        private const val LABEL_WIDTH = 7
        private const val INDENT = "  "
        private const val INSTRUCTION_LABEL = "Instruction: "
        private val SEVERITY_LABELS = mapOf(Severity.ERROR to "ERROR", Severity.WARNING to "WARN")
    }
}
