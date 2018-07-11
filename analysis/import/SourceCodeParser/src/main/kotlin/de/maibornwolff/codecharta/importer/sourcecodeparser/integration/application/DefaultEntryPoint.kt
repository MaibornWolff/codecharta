package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.domain.metrics.DefaultMetricStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.domain.source.DefaultLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile

class DefaultEntryPoint {

    fun fileSummary(fileSource: SourceCode): MetricTable{
        return MetricTable(TaggableFile(DefaultLanguage.NONE_FOUND, emptyList()), DefaultMetricStrategy())
    }
}