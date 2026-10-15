package de.maibornwolff.codecharta.analysers.tools.gate.template

import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.toDisplayText
import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedFile

class ConfigTemplate(private val files: List<AnalysedFile>, private val analyserNames: List<String>) {
    fun render(): String = listOf(header(), input(), output(), analysers(), exitCodes(), metrics(), cycles(), overrides())
        .joinToString("\n\n") { section -> section.joinToString("\n") }
        .plus("\n")

    private fun header() = listOf(
        "## Quality gate for `ccsh gate`. Uncomment the settings and rules you want, then run `ccsh gate --doctor`.",
        "## Anything left commented out is not checked or keeps its default."
    )

    private fun input() = commented("input: .")

    private fun output() = commented("output: ${GateConfig.DEFAULT_OUTPUT}")

    private fun analysers() = commented(listOf("analysers:") + analyserNames.map { "  $it: on" })

    private fun exitCodes() = commented(
        listOf("exitCodes:") + Severity.entries.reversed().map { "  ${it.key}: ${GateConfig.DEFAULT_EXIT_CODES.getValue(it)}" }
    )

    private fun metrics(): List<String> {
        val ranges = metricRanges()
        val nameWidth = ranges.keys.maxOfOrNull { it.length } ?: 0
        val lines = ranges.flatMap { (metric, range) ->
            val found = "# found: min ${range.start.toDisplayText()}, max ${range.endInclusive.toDisplayText()}"
            listOf("  ${"$metric:".padEnd(nameWidth + 1)} $found") + levelLines()
        }
        return commented(listOf("metrics:") + lines)
    }

    private fun metricRanges(): Map<String, ClosedFloatingPointRange<Double>> = files
        .flatMap { it.metrics.entries }
        .groupBy({ it.key }, { it.value })
        .toSortedMap()
        .mapValues { (_, values) -> values.min()..values.max() }

    private fun levelLines() = Severity.entries.flatMap { listOf("    ${it.key}:", "      max:", "      instruction:") }

    private fun cycles() = commented(
        listOf("cycles:") +
            listOf("file", "package").flatMap { listOf("  $it:", "    severity: ${Severity.ERROR.key}", "    instruction:") } +
            listOf("  allow:", "    - - path/to/First.kt", "      - path/to/Second.kt")
    )

    private fun overrides() = commented(
        listOf("overrides:", "  - paths:", "      - src/legacy/**", "    metrics:", "      ${exampleMetric()}: off")
    )

    private fun exampleMetric(): String = metricRanges().keys.firstOrNull() ?: "rloc"

    private fun commented(line: String) = commented(listOf(line))

    private fun commented(lines: List<String>) = lines.map { "# $it" }
}
