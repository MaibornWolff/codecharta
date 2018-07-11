package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopMetricStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr

class OopEntryPoint {
    fun fileSummary(fileSource: SourceCode): MetricTable {
        val sourceCode = TaggableFile(OopLanguage.JAVA, fileSource.lines)
        Antlr.addTagsToSource(sourceCode)
        return MetricTable(sourceCode, OopMetricStrategy())
    }
}