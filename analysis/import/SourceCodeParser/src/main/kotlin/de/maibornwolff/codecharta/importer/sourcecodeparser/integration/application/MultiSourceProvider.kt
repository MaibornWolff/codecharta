package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode

interface MultiSourceProvider {
    fun readSources(): List<SourceCode>
}