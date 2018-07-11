package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.Language
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor


class TaggableLines(val sourceDescriptor: SourceDescriptor, everySourceLine: List<String>): Iterable<Line> {

    // IMPORTANT: line numbers start at 1, but this array starts at 0
    private val lines = everySourceLine
            .mapIndexed { lineNumber, text -> Line(lineNumber + 1, text) }
            .toTypedArray()

    operator fun get(lineNumber: Int): Line =  lines[lineNumber - 1]

    fun addTag(lineNumber: Int, tag: Tags) {
        lines[lineNumber - 1].addTag(tag)
    }

    override fun iterator(): Iterator<Line> = lines.iterator()

    fun text(): String {
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