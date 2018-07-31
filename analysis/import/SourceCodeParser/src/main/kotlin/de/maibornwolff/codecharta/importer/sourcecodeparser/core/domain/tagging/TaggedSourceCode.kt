package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceDescriptor

class TaggedSourceCode(
        val sourceDescriptor: SourceDescriptor,
        everySourceLine: List<String>,
        lineTags: Map<Int, List<Tags>>
) : Iterable<Line> {

    // IMPORTANT: line numbers start at 1, but this array starts at 0
    private val lines = everySourceLine
            .mapIndexed { index, text -> Line(index + 1, text, lineTags.getOrDefault(index + 1, emptyList())) }
            .toTypedArray()

    operator fun get(lineNumber: Int): Line = if (lineNumber != 0) lines[lineNumber - 1] else throw IndexOutOfBoundsException()

    override fun iterator(): Iterator<Line> = lines.iterator()

    fun text(): String {
        return lines.joinToString("\n") { it.text }
    }

}