package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.raw

interface SourceCode {

    fun language(): String
    fun lines(): List<String>
}