package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.FolderSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application.OopEntryPoint
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage


private val oopEntryPoint = OopEntryPoint()
private val defaultEntryPoint = DefaultEntryPoint()

fun calculateSingleMetrics(singleSourceProvider: SingleSourceProvider): MetricTable {
    val singleSource = singleSourceProvider.readSource()
    return when(singleSource.language){
        OopLanguage.JAVA -> oopEntryPoint.fileSummary(singleSource)
        else -> defaultEntryPoint.fileSummary(singleSource)
    }
}

fun calculateMultiMetrics(multiSourceProvider: MultiSourceProvider): FolderSummary {
    val tableMetrics = multiSourceProvider
            .readSources()
            .filter { it.language == OopLanguage.JAVA }
            .map { oopEntryPoint.fileSummary(it) }

    return FolderSummary(tableMetrics.map { it.summary() })
}