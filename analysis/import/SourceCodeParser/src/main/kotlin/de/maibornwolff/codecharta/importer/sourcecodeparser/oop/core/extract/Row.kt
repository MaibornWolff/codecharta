package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.antlrinterop.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.Line

class Row private constructor(line: Line, rloc: Int) {

    val loc = line.lineNumber
    val rloc = (if(hasCodeTags(line)) 1 else 0) + rloc
    val rlocWasIncremented = hasCodeTags(line)
    val text = line.text

    constructor(line: Line, previousRow: Row): this(line, previousRow.rloc)

    private fun hasCodeTags(line: Line) = line.tags().filterIsInstance<CodeTags>().isNotEmpty()

    companion object{
        val NULL = Row(Line.NULL, 0)
    }

}