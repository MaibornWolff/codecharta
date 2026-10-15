package de.maibornwolff.codecharta.analysers.tools.gate.report

import com.google.gson.GsonBuilder
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.toJsonNumber
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.ViolationKind

object JsonReport {
    private val gson = GsonBuilder().setPrettyPrinting().create()

    private val RULE_NAMES = mapOf(
        ViolationKind.METRIC to "metric",
        ViolationKind.FILE_CYCLE to "file-cycle",
        ViolationKind.PACKAGE_CYCLE to "package-cycle",
        ViolationKind.UNKNOWN_METRIC to "unknown-metric"
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

    private fun toJson(violation: Violation) = JsonObject().apply {
        addProperty("rule", RULE_NAMES.getValue(violation.kind))
        addProperty("severity", violation.severity.key)
        violation.path?.let { addProperty("path", it) }
        violation.metric?.let { addProperty("metric", it) }
        violation.value?.let { addProperty("value", it.toJsonNumber()) }
        violation.threshold?.let { addProperty("threshold", it.toJsonNumber()) }
        if (violation.members.isNotEmpty()) add("members", JsonArray().apply { violation.members.forEach(::add) })
        violation.instruction?.let { addProperty("instruction", it) }
    }
}
