package de.maibornwolff.codecharta.analysers.tools.gate.template

import de.maibornwolff.codecharta.analysers.tools.gate.config.AnalyserCatalog
import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigKeys
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.toDisplayText
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedFile

class ConfigTemplate(private val files: List<AnalysedFile>, private val analyserNames: List<String>, private val catalog: AnalyserCatalog) {
    fun render(): String = listOf(header(), input(), output(), parallel(), analysers(), exitCodes(), metrics(), dependencies(), overrides())
        .joinToString("\n\n") { section -> section.joinToString("\n") }
        .plus("\n")

    private fun header() = listOf(
        "## Quality gate for `ccsh gate`. Uncomment the settings and rules you want, then run `ccsh gate --doctor`.",
        "## Anything left commented out is not checked or keeps its default."
    )

    private fun input() = commented("${ConfigKeys.INPUT}: .")

    private fun parallel() = commented("${ConfigKeys.PARALLEL}: off")

    private fun output() = commented("${ConfigKeys.OUTPUT}: ${GateConfig.DEFAULT_OUTPUT}")

    private fun analysers() = commented(
        listOf("${ConfigKeys.ANALYSERS}:  ## on, off, or the analyser's options instead of on, e.g. exclude: [generated/]") +
            analyserNames.flatMap { listOf("  $it: on", "    ## options: ${catalog.optionNames(it).joinToString()}") }
    )

    private fun exitCodes() = commented(
        listOf("${ConfigKeys.EXIT_CODES}:") +
            Severity.entries.reversed().map { "  ${it.key}: ${GateConfig.DEFAULT_EXIT_CODES.getValue(it)}" }
    )

    private fun metrics(): List<String> {
        val ranges = metricRanges()
        val nameWidth = ranges.keys.maxOfOrNull { it.length } ?: 0
        val lines = ranges.flatMap { (metric, range) ->
            val found = "# found: min ${range.start.toDisplayText()}, max ${range.endInclusive.toDisplayText()}"
            listOf("  ${"$metric:".padEnd(nameWidth + 1)} $found") + levelLines()
        }
        return commented(listOf("${ConfigKeys.METRICS}:") + lines)
    }

    private fun metricRanges(): Map<String, ClosedFloatingPointRange<Double>> = files
        .flatMap { it.metrics.entries }
        .groupBy({ it.key }, { it.value })
        .toSortedMap()
        .mapValues { (_, values) -> values.min()..values.max() }

    private fun levelLines() = Severity.entries.flatMap {
        listOf("    ${it.key}:", "      ${ConfigKeys.MAX}:", "      ${ConfigKeys.INSTRUCTION}:")
    }

    private fun dependencies() = commented(
        listOf("${ConfigKeys.DEPENDENCIES}:") +
            cycleRuleLines(ConfigKeys.CYCLES_BETWEEN_FILES, "path/to/Generated.kt") +
            cycleRuleLines(ConfigKeys.CYCLES_INSIDE_FILES, "path/to/Generated.kt") +
            cycleRuleLines(ConfigKeys.UPWARD, "path/to/legacy")
    )

    private fun cycleRuleLines(rule: String, ignoredExample: String) = listOf(
        "  $rule:",
        "    ${ConfigKeys.SEVERITY}: ${Severity.ERROR.key}",
        "    ${ConfigKeys.INSTRUCTION}:",
        "    ${ConfigKeys.IGNORE}:",
        "      - $ignoredExample"
    )

    private fun overrides() = commented(
        listOf(
            "${ConfigKeys.OVERRIDES}:",
            "  - ${ConfigKeys.PATHS}:",
            "      - src/legacy/**",
            "    ${ConfigKeys.METRICS}:",
            "      ${exampleMetric()}: off"
        )
    )

    private fun exampleMetric(): String = metricRanges().keys.firstOrNull() ?: "rloc"

    private fun commented(line: String) = commented(listOf(line))

    private fun commented(lines: List<String>) = lines.map { "# $it" }
}
