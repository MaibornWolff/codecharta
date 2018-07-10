package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.SourceCode

interface LocationResolver {

    fun resolve(locations: List<String>): List<SourceCode>
}