package de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging

data class Line(val lineNumber: Int, val text: String, val tags: List<Tags>) {

    companion object {
        val NULL = Line(0, "", emptyList())
    }

}