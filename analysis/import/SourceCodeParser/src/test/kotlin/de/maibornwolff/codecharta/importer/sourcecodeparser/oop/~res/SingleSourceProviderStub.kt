package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.MultiSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.SingleSourceProvider

class SingleSourceProviderStub(private val sourceCode: SourceCode): SingleSourceProvider {
    override fun readSource(): SourceCode = sourceCode
}

class MultiSourceProviderStub(private val sourceCodes: List<SourceCode>): MultiSourceProvider {
    override fun readSources(): List<SourceCode> = sourceCodes
}