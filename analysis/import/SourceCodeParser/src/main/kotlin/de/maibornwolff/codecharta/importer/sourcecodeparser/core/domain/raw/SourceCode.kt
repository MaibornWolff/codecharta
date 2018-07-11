package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw

interface SourceCode {

    fun language(): Language
    fun lines(): List<String>
}