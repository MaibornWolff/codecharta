package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.antlrinterop

interface Source {
    fun text(): String
    fun addTag(lineNumber: Int, tag: Tags)
}