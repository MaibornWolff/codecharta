package de.maibornwolff.codecharta.importer.sourcecodeparser.core.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.SourceCode

interface GetMetricsUseCase {
    fun fileSummary(fileSource: SourceCode)
    fun folderSummary(folderSource: List<SourceCode>)
}