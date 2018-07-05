package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.antlrinterop.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.Line

class Row private constructor(line: Line, previousRloc: Int) {

    val loc = line.lineNumber
    val rloc = (if(hasCodeTags(line)) 1 else 0) + previousRloc
    val rlocWasIncremented = hasCodeTags(line)
    val text = line.text
    val tags = line.tags()

    constructor(line: Line, previousRow: Row): this(line, previousRow.rloc)

    private fun hasCodeTags(line: Line) = line.tags().filterIsInstance<CodeTags>().isNotEmpty()

    override fun toString(): String {
        return "Row($loc: $text | tags=$tags)"
    }

    companion object{
        val NULL = Row(Line.NULL, 0)
    }

}