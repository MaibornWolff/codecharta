package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application.OopEntryPoint
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage


private val oopEntryPoint = OopEntryPoint()
private val defaultEntryPoint = DefaultEntryPoint()

fun calculateSingleMetrics(singleSourceProvider: SingleSourceProvider): DetailedMetricTable {
    val singleSource = singleSourceProvider.readSource()
    return when(singleSource.language){
        OopLanguage.JAVA -> oopEntryPoint.calculateSingleMetrics(singleSource)
        else -> defaultEntryPoint.fileSummary(singleSource)
    }
}

fun calculateMultiMetrics(multiSourceProvider: MultiSourceProvider): OverviewMetric {
    val tableMetrics = multiSourceProvider
            .readSources()
            .filter { it.language == OopLanguage.JAVA }
            .map { oopEntryPoint.calculateSingleMetrics(it) }

    return OverviewMetric(tableMetrics.map { it.sum })
}