package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.toDisplayText
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.ViolationKind
import java.io.PrintStream

class ConsoleReport(private val output: PrintStream) {
    fun print(result: GateResult) {
        if (result.violations.isEmpty()) {
            output.println("No rule broken, ${result.filesChecked} files checked")
            return
        }
        groupsInReadingOrder(result.violations).forEach { group ->
            printGroup(group)
            output.println()
        }
        output.println(summary(result))
    }

    private fun groupsInReadingOrder(violations: List<Violation>): List<List<Violation>> = violations
        .groupBy { listOf(it.severity, it.kind, it.metric, it.threshold, it.message) }
        .values
        .sortedWith(
            compareByDescending<List<Violation>> { it.first().severity }
                .thenBy { it.first().kind }
                .thenBy { it.first().metric }
                .thenByDescending { it.first().threshold }
        )

    private fun printGroup(group: List<Violation>) {
        val first = group.first()
        output.println(SEVERITY_LABELS.getValue(first.severity).padEnd(LABEL_WIDTH) + title(first))
        first.message?.let { output.println(" ".repeat(LABEL_WIDTH) + it) }
        when (first.kind) {
            ViolationKind.METRIC -> printMetricValues(group)
            ViolationKind.FILE_CYCLE, ViolationKind.PACKAGE_CYCLE -> group.forEach {
                output.println(
                    INDENT + it.members.joinToString(", ")
                )
            }
            ViolationKind.UNKNOWN_METRIC -> Unit
        }
    }

    private fun title(violation: Violation): String = when (violation.kind) {
        ViolationKind.METRIC -> "${violation.metric} > ${violation.threshold!!.toDisplayText()}"
        ViolationKind.FILE_CYCLE -> "file cycle"
        ViolationKind.PACKAGE_CYCLE -> "package cycle"
        ViolationKind.UNKNOWN_METRIC -> "unknown metric: ${violation.metric}"
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
        return "$errors, $warnings, ${result.filesChecked} files checked"
    }

    private fun counted(count: Int, noun: String) = if (count == 1) "1 $noun" else "$count ${noun}s"

    companion object {
        private const val LABEL_WIDTH = 7
        private const val INDENT = "  "
        private val SEVERITY_LABELS = mapOf(Severity.ERROR to "ERROR", Severity.WARNING to "WARN")
    }
}
