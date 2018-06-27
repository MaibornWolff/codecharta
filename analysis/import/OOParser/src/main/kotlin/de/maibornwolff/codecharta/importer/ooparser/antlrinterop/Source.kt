package de.maibornwolff.codecharta.importer.ooparser.antlrinterop

interface Source {
    fun text(): String
    fun addTag(lineNumber: Int, tag: Tags)
}