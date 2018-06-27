package de.maibornwolff.codecharta.importer.ooparser

class SourceCode(everySourceLine: List<String>): Source {

    // IMPORTANT: line numbers start at 1, but this array starts at 0
    private val lines = everySourceLine
            .mapIndexed { lineNumber, text -> Line(lineNumber + 1, text) }
            .toTypedArray()

    override fun addTag(lineNumber: Int, tag: Tags) {
        lines[lineNumber - 1].addTag(tag)
    }

    override fun text(): String {
        return lines.joinToString("\n") { it.text() }
    }

    operator fun get(lineNumber: Int): Line{
        return lines[lineNumber - 1]
    }

    fun linesOfCode(): Int {
        return lines.size
    }

    fun linesWithTag(tag: Tags): Collection<Int> {
        return lines
                .filter { it.tags().contains(tag) }
                .map { it.lineNumber }
    }

}