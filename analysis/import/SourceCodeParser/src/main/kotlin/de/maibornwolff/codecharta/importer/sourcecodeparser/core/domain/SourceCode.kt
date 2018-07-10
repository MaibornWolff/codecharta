package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain

interface SourceCode {

    fun language(): String
    fun lines(): List<String>
}