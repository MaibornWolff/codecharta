package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.TaggedSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.DefaultMetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.DefaultOverviewMetricCalculationStrategy

class DefaultEntryPoint {

    fun fileSummary(fileSource: SourceCode): DetailedMetricTable {
        return DetailedMetricTable(
                TaggedSourceCode(fileSource.sourceDescriptor, emptyList(), emptyMap()),
                DefaultMetricCalculationStrategy(),
                DefaultOverviewMetricCalculationStrategy()
        )
    }
}