package de.maibornwolff.codecharta.analysers.tools.gate.report

import com.google.gson.GsonBuilder
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.toJsonNumber
import de.maibornwolff.codecharta.analysers.tools.gate.rules.CycleViolation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Declaration
import de.maibornwolff.codecharta.analysers.tools.gate.rules.DependenciesNotChecked
import de.maibornwolff.codecharta.analysers.tools.gate.rules.GateResult
import de.maibornwolff.codecharta.analysers.tools.gate.rules.MetricViolation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.UnknownMetric
import de.maibornwolff.codecharta.analysers.tools.gate.rules.UpwardViolation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation

object JsonReport {
    private val gson = GsonBuilder().setPrettyPrinting().create()

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
        addProperty("rule", ruleNameOf(violation))
        addProperty("severity", violation.severity.key)
        addDetails(this, violation)
        violation.instruction?.let { addProperty("instruction", it) }
    }

    private fun ruleNameOf(violation: Violation): String = when (violation) {
        is MetricViolation -> "metric"
        is UnknownMetric -> "unknown-metric"
        is CycleViolation -> if (violation.isInsideOneFile) "cycle-inside-file" else "cycle-between-files"
        is UpwardViolation -> "upward-dependency"
        is DependenciesNotChecked -> "dependencies-not-checked"
    }

    private fun addDetails(json: JsonObject, violation: Violation) {
        when (violation) {
            is MetricViolation -> {
                json.addProperty("path", violation.path)
                json.addProperty("metric", violation.metric)
                json.addProperty("value", violation.value.toJsonNumber())
                json.addProperty(violation.limit.bound.key, violation.limit.value.toJsonNumber())
            }
            is UnknownMetric -> json.addProperty("metric", violation.metric)
            is CycleViolation -> {
                if (violation.isInsideOneFile) json.addProperty("path", violation.files.single())
                json.add("members", JsonArray().apply { violation.files.forEach(::add) })
                json.add("declarations", declarationsOf(violation.declarations))
            }
            is UpwardViolation -> {
                json.addProperty("path", violation.from.file)
                json.addProperty("target", violation.to.file)
                json.add("declarations", declarationsOf(listOf(violation.from, violation.to)))
            }
            is DependenciesNotChecked -> Unit
        }
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
}
