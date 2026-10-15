package de.maibornwolff.codecharta.analysers.tools.gate.report

import com.google.gson.GsonBuilder
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.toJsonNumber
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Declaration
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.ViolationKind

object JsonReport {
    private val gson = GsonBuilder().setPrettyPrinting().create()

    private val RULE_NAMES = mapOf(
        ViolationKind.METRIC to "metric",
        ViolationKind.CYCLE_BETWEEN_FILES to "cycle-between-files",
        ViolationKind.CYCLE_INSIDE_FILE to "cycle-inside-file",
        ViolationKind.UPWARD_DEPENDENCY to "upward-dependency",
        ViolationKind.UNKNOWN_METRIC to "unknown-metric",
        ViolationKind.CYCLES_NOT_CHECKED to "cycles-not-checked"
    )

    fun render(result: GateResult, config: GateConfig): String {
        val report = JsonObject()
        report.addProperty("exitCode", result.exitCode(config))
        report.add("summary", summary(result))
        report.add("violations", JsonArray().apply { result.violations.forEach { add(toJson(it)) } })
        return gson.toJson(report) + "\n"
    }

    private fun summary(result: GateResult) = JsonObject().apply {
        Severity.entries.reversed().forEach { addProperty(it.key, result.count(it)) }
        addProperty("files", result.filesChecked)
    }

    private fun declarationsOf(declarations: List<Declaration>) = JsonArray().apply {
        declarations.forEach { declaration ->
            add(
                JsonObject().apply {
                    addProperty("file", declaration.file)
                    addProperty("name", declaration.name)
                }
            )
        }
    }

    private fun jsonArrayOf(values: List<String>) = JsonArray().apply { values.forEach(::add) }

    private fun toJson(violation: Violation) = JsonObject().apply {
        addProperty("rule", RULE_NAMES.getValue(violation.kind))
        addProperty("severity", violation.severity.key)
        violation.path?.let { addProperty("path", it) }
        violation.target?.let { addProperty("target", it) }
        violation.metric?.let { addProperty("metric", it) }
        violation.value?.let { addProperty("value", it.toJsonNumber()) }
        violation.threshold?.let { addProperty("threshold", it.toJsonNumber()) }
        if (violation.members.isNotEmpty()) add("members", jsonArrayOf(violation.members))
        if (violation.declarations.isNotEmpty()) add("declarations", declarationsOf(violation.declarations))
        violation.instruction?.let { addProperty("instruction", it) }
    }
}
