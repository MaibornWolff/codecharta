package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.LocationResolver

class LocationResolverStub(private val sourceCodes: List<SourceCode>): LocationResolver {
    override fun resolve(locations: List<String>): List<SourceCode> = sourceCodes
}