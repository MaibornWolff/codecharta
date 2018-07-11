package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.DefaultMetricCalculationStrategy

class DefaultEntryPoint {

    fun fileSummary(fileSource: SourceCode): DetailedMetricTable{
        return DetailedMetricTable(
                TaggableSourceCode(fileSource.sourceDescriptor, emptyList()),
                DefaultMetricCalculationStrategy()
        )
    }
}