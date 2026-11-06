package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

internal class LineScan(val line: String, regionAtLineStart: Region?) {
    var position = 0
    var hasCode = false
    var hasComment = false
    var hasCommentBesideDocString = false
    var isDocStringOpenedOnLine = false
    val current: Char get() = line[position]
    val isAtWordStart: Boolean get() = line.getOrNull(position - 1).let { it == null || it.isWhitespace() || it in WORD_SEPARATORS }

    init {
        regionAtLineStart?.let(::mark)
    }

    fun mark(region: Region) {
        if (region.isComment) hasComment = true else hasCode = true
        if (region.isComment && region != Region.DOC_QUOTE) hasCommentBesideDocString = true
    }

    fun startsWith(text: String) = line.startsWith(text, position)

    companion object {
        private const val WORD_SEPARATORS = ";|&()"
    }
}

internal enum class Region(val isComment: Boolean, val isQuote: Boolean = false) {
    LINE_COMMENT(true),
    BLOCK_COMMENT(true),
    DOC_QUOTE(true, isQuote = true),
    QUOTE(false, isQuote = true),
    VERBATIM_QUOTE(false),
    CODE(false)
}

internal data class Marker(val delimiters: Delimiters, val region: Region, val isNestable: Boolean = false) {
    private val closesAtLastOfRun: Boolean
        get() = region != Region.BLOCK_COMMENT &&
            delimiters.end.length >= MIN_QUOTE_RUN &&
            delimiters.end.all { it == delimiters.end.first() }

    fun endsAt(scan: LineScan): Boolean {
        val end = delimiters.end
        if (!scan.startsWith(end)) return false
        val isFollowedByEndCharacter = scan.line.getOrNull(scan.position + end.length) == end.last()
        return !(closesAtLastOfRun && isFollowedByEndCharacter)
    }

    companion object {
        private const val MIN_QUOTE_RUN = 3

        fun allOf(syntax: LanguageSyntax): List<Marker> = buildList {
            syntax.lineComments.forEach { add(Marker(Delimiters(it, ""), Region.LINE_COMMENT)) }
            syntax.codeMarkers.forEach { add(Marker(Delimiters(it, ""), Region.CODE)) }
            syntax.blockComments.forEach { add(Marker(it, Region.BLOCK_COMMENT)) }
            syntax.nestedBlockComments.forEach { add(Marker(it, Region.BLOCK_COMMENT, isNestable = true)) }
            syntax.docQuotes.forEach { add(Marker(it, Region.DOC_QUOTE)) }
            syntax.quotes.forEach { add(Marker(it, Region.QUOTE)) }
            syntax.verbatimQuotes.forEach { add(Marker(it, Region.VERBATIM_QUOTE)) }
        }.sortedByDescending { it.delimiters.start.length }
    }
}

internal class OpenRegion(val marker: Marker) {
    var depth = 1
}
