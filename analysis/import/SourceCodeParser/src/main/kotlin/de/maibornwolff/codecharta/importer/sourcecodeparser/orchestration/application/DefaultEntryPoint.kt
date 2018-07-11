package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TagableSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.DefaultMetricCalculationStrategy

class DefaultEntryPoint {

    fun fileSummary(fileSource: SourceCode): DetailedMetricTable{
        return DetailedMetricTable(
                TagableSourceCode(fileSource.sourceDescriptor, emptyList()),
                DefaultMetricCalculationStrategy()
        )
    }
}