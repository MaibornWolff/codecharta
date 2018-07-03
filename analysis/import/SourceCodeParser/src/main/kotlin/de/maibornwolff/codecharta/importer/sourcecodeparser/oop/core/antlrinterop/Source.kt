package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.antlrinterop

interface Source {
    fun text(): String
    fun addTag(lineNumber: Int, tag: Tags)
}