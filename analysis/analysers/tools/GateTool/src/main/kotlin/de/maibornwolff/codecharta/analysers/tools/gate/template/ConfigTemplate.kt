package de.maibornwolff.codecharta.analysers.tools.gate.template

import de.maibornwolff.codecharta.analysers.tools.gate.config.AnalyserCatalog
import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigKeys
import de.maibornwolff.codecharta.analysers.tools.gate.config.GateConfig
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.toDisplayText
import kotlin.math.roundToLong

class ConfigTemplate(
    private val metrics: List<MetricSummary>,
    private val analyserNames: List<String>,
    private val catalog: AnalyserCatalog
) {
    private val exampleMetric = metrics.find { it.name == PREFERRED_EXAMPLE_METRIC } ?: metrics.firstOrNull()

    fun render(): String = listOf(header(), settings(), exclude(), analysers(), exitCodes(), metricRules(), dependencies(), overrides())
        .joinToString("\n\n") { section -> section.joinToString("\n") }
        .plus("\n")

    private fun header() = listOf(
        "## Quality gate for `ccsh gate`: https://maibornwolff.github.io/codecharta/docs/analysis/quality-gate",
        "## Uncomment what you want to check, then run `ccsh gate --doctor`. Anything left commented out is not checked or",
        "## keeps its default; only the analysers listed as on run. Paths are relative to the project folder."
    )

    private fun settings() =
        commented(listOf("${ConfigKeys.INPUT}: .", "${ConfigKeys.OUTPUT}: ${GateConfig.DEFAULT_OUTPUT}")) + "${ConfigKeys.PARALLEL}: on"

    private fun exclude() =
        commented(listOf("${ConfigKeys.EXCLUDE}:  ## .gitignore patterns of files no rule checks", "  - \"**/generated/**\""))

    private fun analysers() = listOf(
        "${ConfigKeys.ANALYSERS}:  ## on, off, or the analyser's own options instead of on (its exclude takes regular expressions)"
    ) +
        analyserNames.flatMap { listOf("  $it: on", "    ## options: ${catalog.optionNames(it).joinToString()}") }

    private fun exitCodes() = listOf("${ConfigKeys.EXIT_CODES}:") +
        Severity.entries.reversed().map { "  ${it.key}: ${GateConfig.DEFAULT_EXIT_CODES.getValue(it)}" }

    private fun metricRules(): List<String> {
        val example = exampleMetric ?: return listOf(NO_METRICS)
        return listOf("## Metrics found in this project, with the range of their values:") + metricOverview() +
            "## An example rule that today's worst file still passes; copy it for each metric you want to limit:" +
            commented(listOf("${ConfigKeys.METRICS}:") + exampleRule(example))
    }

    private fun metricOverview(): List<String> {
        val nameWidth = metrics.maxOf { it.name.length } + COLUMN_GAP
        val ranges = metrics.map { "${it.lowest.toDisplayText()} – ${it.highest.toDisplayText()}" }
        val rangeWidth = ranges.maxOf { it.length } + COLUMN_GAP
        return metrics.zip(
            ranges
        ) { metric, range -> "##   ${metric.name.padEnd(nameWidth)}${range.padEnd(rangeWidth)}${metric.title.orEmpty()}".trimEnd() }
    }

    private fun exampleRule(metric: MetricSummary): List<String> {
        val warningMax = (metric.highest * WARNING_SHARE_OF_WORST).roundToLong().toDouble()
        return listOf(
            "  ${metric.name}:",
            "    ${Severity.WARNING.key}:",
            "      ${ConfigKeys.MAX}: ${warningMax.toDisplayText()}",
            "      ${ConfigKeys.INSTRUCTION}: Tell whoever breaks this rule what to do about it.",
            "    ${Severity.ERROR.key}:",
            "      ${ConfigKeys.MAX}: ${metric.highest.toDisplayText()}"
        )
    }

    private fun dependencies() = commented(
        listOf("${ConfigKeys.DEPENDENCIES}:  ## counted like the dependency view in the visualization") +
            dependencyRuleLines(ConfigKeys.CYCLES_BETWEEN_FILES, Severity.ERROR) +
            "    ${ConfigKeys.INSTRUCTION}: Break the cycle by moving what both files need into a file of its own." +
            dependencyRuleLines(ConfigKeys.CYCLES_INSIDE_FILES, Severity.WARNING) +
            dependencyRuleLines(ConfigKeys.UPWARD, Severity.WARNING)
    )

    private fun dependencyRuleLines(rule: String, severity: Severity) = listOf("  $rule:", "    ${ConfigKeys.SEVERITY}: ${severity.key}")

    private fun overrides() = commented(
        listOf(
            "${ConfigKeys.OVERRIDES}:  ## other limits for the files the patterns match; a later override changes an earlier one",
            "  - ${ConfigKeys.PATHS}:",
            "      - \"**/test/**\"",
            "    ${ConfigKeys.METRICS}:",
            "      ${exampleMetric?.name ?: PREFERRED_EXAMPLE_METRIC}: off"
        )
    )

    private fun commented(lines: List<String>) = lines.map { "# $it" }

    companion object {
        private const val PREFERRED_EXAMPLE_METRIC = "rloc"
        private const val WARNING_SHARE_OF_WORST = 0.75
        private const val COLUMN_GAP = 2
        private const val NO_METRICS = "## The analysis found no metrics, so there is no metric rule to suggest."
    }
}
