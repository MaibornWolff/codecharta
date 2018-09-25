package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source

data class SourceCode(val sourceDescriptor: SourceDescriptor, val lines: List<String>)