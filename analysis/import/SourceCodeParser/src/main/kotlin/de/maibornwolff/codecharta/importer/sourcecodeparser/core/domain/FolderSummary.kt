package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.Language

class FolderSummary(fileMetrics: List<FileSummary>) {

    private val languageFileCount = sumFiles(fileMetrics)
    private val folderMetrics = sumMetrics(fileMetrics)

    fun languageValue(language: Language) = languageFileCount[language]
    fun metricValue(metricType: MetricType) = folderMetrics[metricType]

    private fun sumMetrics(fileMetrics: List<FileSummary>): Map<MetricType, Int>{
        val sum = mutableMapOf<MetricType, Int>()

        fileMetrics.forEach {
            it.forEach { sum[it.key] = it.value + sum.getOrDefault(it.key, 0) }
        }

        return sum
    }

    private fun sumFiles(fileMetrics: List<FileSummary>): Map<Language, Int>{
        val sum = mutableMapOf<Language, Int>()

        fileMetrics.forEach {
            sum[it.language] = 1 + sum.getOrDefault(it.language, 0)
        }

        return sum
    }
}