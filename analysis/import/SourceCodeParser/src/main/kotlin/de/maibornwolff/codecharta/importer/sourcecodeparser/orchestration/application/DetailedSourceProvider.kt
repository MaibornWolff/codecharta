package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode

interface DetailedSourceProvider {

    fun readSource(): SourceCode
}