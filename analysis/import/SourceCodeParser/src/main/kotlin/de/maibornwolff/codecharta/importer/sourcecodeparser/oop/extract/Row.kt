package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.antlrinterop.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.intermediate.Line

class Row private constructor(line: Line, rloc: Int) {

    val loc = line.lineNumber
    val rloc = hasCodeTags(line) + rloc

    constructor(line: Line, previousRow: Row): this(line, previousRow.rloc)

    private fun hasCodeTags(line: Line)
            = if(line.tags().filterIsInstance<CodeTags>().isNotEmpty()) 1 else 0

    companion object{
        val NULL = Row(Line.NULL, 0)
    }

}