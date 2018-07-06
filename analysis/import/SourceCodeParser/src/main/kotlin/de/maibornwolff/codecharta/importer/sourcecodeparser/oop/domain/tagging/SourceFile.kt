package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging

class SourceFile(everySourceLine: List<String>): Iterable<Line> {

    // IMPORTANT: line numbers start at 1, but this array starts at 0
    private val lines = everySourceLine
            .mapIndexed { lineNumber, text -> Line(lineNumber + 1, text) }
            .toTypedArray()

    operator fun get(lineNumber: Int): Line =  lines[lineNumber - 1]

    override fun iterator(): Iterator<Line> = lines.iterator()

    fun addTag(lineNumber: Int, tag: Tags) {
        lines[lineNumber - 1].addTag(tag)
    }

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