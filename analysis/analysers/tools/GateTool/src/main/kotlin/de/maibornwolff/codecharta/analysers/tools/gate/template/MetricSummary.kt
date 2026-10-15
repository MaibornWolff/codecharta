package de.maibornwolff.codecharta.analysers.tools.gate.template

import de.maibornwolff.codecharta.analysers.tools.gate.rules.AnalysedFile

data class MetricSummary(val name: String, val lowest: Double, val highest: Double, val title: String?) {
    companion object {
        fun allOf(files: List<AnalysedFile>, titles: Map<String, String>): List<MetricSummary> = files
            .flatMap { it.metrics.entries }
            .groupBy({ it.key }, { it.value })
            .toSortedMap()
            .map { (name, values) -> MetricSummary(name, values.min(), values.max(), titles[name]) }
    }
}
