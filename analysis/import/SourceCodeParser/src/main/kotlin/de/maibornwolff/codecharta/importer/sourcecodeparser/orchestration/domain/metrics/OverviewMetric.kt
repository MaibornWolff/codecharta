package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTableSum
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.Language

class OverviewMetric(val tableSums: List<DetailedMetricTableSum>) {

    private val languageFileCount = sumFiles(tableSums)
    private val folderMetrics = sumMetrics(tableSums)

    fun languageValue(language: Language) = languageFileCount.getOrDefault(language, 0)
    fun metricValue(metricType: MetricType) = folderMetrics.getOrDefault(metricType, 0)

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
            sum[it.sourceDescriptor.language] = 1 + sum.getOrDefault(it.sourceDescriptor.language, 0)
        }

        return sum
    }
}