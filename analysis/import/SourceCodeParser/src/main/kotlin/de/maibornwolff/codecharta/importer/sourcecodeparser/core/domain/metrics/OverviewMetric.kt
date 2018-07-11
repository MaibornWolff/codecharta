package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.Language

class OverviewMetric(val tableSums: List<DetailedMetricTableSum>) {

    private val languageFileCount = sumFiles(tableSums)
    private val folderMetrics = sumMetrics(tableSums)

    fun languageValue(language: Language) = languageFileCount[language]
    fun metricValue(metricType: MetricType) = folderMetrics[metricType]

    private fun sumMetrics(fileMetrics: List<DetailedMetricTableSum>): Map<MetricType, Int>{
        val sum = mutableMapOf<MetricType, Int>()

        fileMetrics.forEach {
            it.forEach { sum[it.key] = it.value + sum.getOrDefault(it.key, 0) }
        }

        return sum
    }

    private fun sumFiles(fileMetrics: List<DetailedMetricTableSum>): Map<Language, Int>{
        val sum = mutableMapOf<Language, Int>()

        fileMetrics.forEach {
            sum[it.language] = 1 + sum.getOrDefault(it.language, 0)
        }

        return sum
    }
}