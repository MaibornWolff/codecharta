package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.antlrinterop.Source
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.antlrinterop.Tags

class SourceCode(everySourceLine: List<String>): Iterable<Line>, Source {

    // IMPORTANT: line numbers start at 1, but this array starts at 0
    private val lines = everySourceLine
            .mapIndexed { lineNumber, text -> Line(lineNumber + 1, text) }
            .toTypedArray()

    operator fun get(lineNumber: Int): Line =  lines[lineNumber - 1]

    override fun iterator(): Iterator<Line> = lines.iterator()

    override fun addTag(lineNumber: Int, tag: Tags) {
        lines[lineNumber - 1].addTag(tag)
    }

    override fun text(): String {
        return lines.joinToString("\n") { it.text }
    }


    fun lineCount(): Int {
        return lines.size
    }

    fun linesWithTag(tag: Tags): Collection<Int> {
        return lines
                .filter { it.tags().contains(tag) }
                .map { it.lineNumber }
    }

}