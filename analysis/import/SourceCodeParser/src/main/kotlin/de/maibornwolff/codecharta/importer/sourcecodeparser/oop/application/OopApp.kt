package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopMetricStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr

class OopApp {
    fun fileSummary(fileSource: SourceCode): MetricTable {
        val sourceCode = TaggableFile(fileSource.lines())
        Antlr.addTagsToSource(sourceCode)
        return MetricTable(sourceCode, OopMetricStrategy())
    }
}