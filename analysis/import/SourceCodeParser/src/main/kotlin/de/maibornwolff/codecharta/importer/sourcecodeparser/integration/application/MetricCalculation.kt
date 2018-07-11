package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MultiMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.SingleMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application.OopEntryPoint
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage


private val oopEntryPoint = OopEntryPoint()
private val defaultEntryPoint = DefaultEntryPoint()

fun calculateSingleMetrics(singleSourceProvider: SingleSourceProvider): SingleMetricTable {
    val singleSource = singleSourceProvider.readSource()
    return when(singleSource.language){
        OopLanguage.JAVA -> oopEntryPoint.calculateSingleMetrics(singleSource)
        else -> defaultEntryPoint.fileSummary(singleSource)
    }
}

fun calculateMultiMetrics(multiSourceProvider: MultiSourceProvider): MultiMetric {
    val tableMetrics = multiSourceProvider
            .readSources()
            .filter { it.language == OopLanguage.JAVA }
            .map { oopEntryPoint.calculateSingleMetrics(it) }

    return MultiMetric(tableMetrics.map { it.sum })
}