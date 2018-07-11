package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.DefaultMetricCalculationStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.source.DefaultLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableLines

class DefaultEntryPoint {

    fun fileSummary(fileSource: SourceCode): DetailedMetricTable{
        return DetailedMetricTable(
                TaggableLines(fileSource.sourceDescriptor, emptyList()),
                DefaultMetricCalculationStrategy()
        )
    }
}