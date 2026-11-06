package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

data class LineKind(val hasCode: Boolean, val hasComment: Boolean)

class LineClassifier(private val syntax: LanguageSyntax) {
    private val markers = collectMarkers(syntax).sortedByDescending { it.delimiters.start.length }
    private val isSingleQuoteCharLiteral = markers.none { it.delimiters.start.startsWith(SINGLE_QUOTE) }
    private val heredocTerminators = ArrayDeque<String>()
    private val measuredBlock = MeasuredBlockTracker(syntax.measuredBlock)
    private var openRegion: OpenRegion? = null
    private var isInDataSection = false
    private var isLineCommentContinued = false

    fun classify(line: String): LineKind = when {
        !measuredBlock.isMeasured(line) -> UNMEASURED_LINE
        isInDataSection -> CODE_LINE
        heredocTerminators.isNotEmpty() -> classifyHeredocBody(line)
        isLineCommentContinued -> classifyContinuedLineComment(line)
        isDataSectionStart(line) -> startDataSection()
        else -> scanLine(line)
    }

    private fun scanLine(line: String): LineKind {
        val scan = LineScan(line, openRegion?.marker?.region)
        while (scan.position < line.length) {
            val region = openRegion
            if (region == null) scanCode(scan) else scanRegion(scan, region)
        }
        return LineKind(scan.hasCode, scan.hasComment)
    }

    private fun classifyHeredocBody(line: String): LineKind {
        val terminator = heredocTerminators.first()
        val content = line.trimStart()
        val isTerminator = content.startsWith(terminator) && content.getOrNull(terminator.length)?.isWordCharacter() != true
        if (isTerminator) heredocTerminators.removeFirst()
        return CODE_LINE
    }

    private fun classifyContinuedLineComment(line: String): LineKind {
        isLineCommentContinued = endsWithBackslash(line)
        return COMMENT_LINE
    }

    private fun isDataSectionStart(line: String) = openRegion == null && line.trimEnd() == syntax.dataSectionMarker

    private fun startDataSection(): LineKind {
        isInDataSection = true
        return CODE_LINE
    }

    private fun scanCode(scan: LineScan) {
        if (scan.current.isWhitespace()) {
            scan.position++
            return
        }
        if (openHeredoc(scan) || openPercentLiteral(scan) || openMultiLineRegex(scan)) return
        val marker = markers.firstOrNull { isMarkerAt(scan, it) }
        if (marker == null) {
            scan.hasCode = true
            scan.position += plainCodeLengthAt(scan)
            return
        }
        open(scan, marker)
    }

    private fun openHeredoc(scan: LineScan): Boolean {
        if (scan.line.getOrNull(scan.position - 1) == HEREDOC_START) return false
        val match = syntax.heredocOpeners.firstNotNullOfOrNull { it.terminatorAt(scan.line, scan.position) } ?: return false
        heredocTerminators.addLast(match.terminator)
        scan.hasCode = true
        scan.position += match.openerLength
        return true
    }

    private fun openPercentLiteral(scan: LineScan): Boolean {
        val opener = syntax.percentLiteral?.openerAt(scan.line, scan.position) ?: return false
        openRegion = OpenRegion(Marker(opener.delimiters, Region.QUOTE, opener.isNestable))
        scan.mark(Region.QUOTE)
        scan.position += opener.openerLength
        return true
    }

    private fun openMultiLineRegex(scan: LineScan): Boolean {
        if (syntax.regexLiteral?.opensMultiLineAt(scan.line, scan.position) != true) return false
        openRegion = OpenRegion(Marker(REGEX_DELIMITERS, Region.QUOTE))
        scan.mark(Region.QUOTE)
        scan.position += REGEX_DELIMITERS.start.length
        return true
    }

    private fun isMarkerAt(scan: LineScan, marker: Marker): Boolean {
        if (!scan.line.startsWith(marker.delimiters.start, scan.position)) return false
        val isWordStartRequired = marker.region == Region.LINE_COMMENT && syntax.isLineCommentOnlyAtWordStart
        return !isWordStartRequired || scan.isAtWordStart
    }

    private fun plainCodeLengthAt(scan: LineScan): Int = when {
        syntax.isBackslashEscapeInCode && scan.current == ESCAPE -> ESCAPE_LENGTH
        syntax.regexLiteral != null -> syntax.regexLiteral.lengthAt(scan.line, scan.position)
        isSingleQuoteCharLiteral && scan.current == SINGLE_QUOTE -> CHAR_LITERAL.matchAt(scan.line, scan.position)?.value?.length
        else -> null
    } ?: 1

    private fun open(scan: LineScan, marker: Marker) {
        val region = if (marker.region == Region.DOC_QUOTE && scan.hasCode) Region.QUOTE else marker.region
        scan.mark(region)
        when (region) {
            Region.LINE_COMMENT -> {
                isLineCommentContinued = syntax.isLineCommentContinuedByBackslash && endsWithBackslash(scan.line)
                scan.position = scan.line.length
            }
            Region.CODE -> scan.position += marker.delimiters.start.length
            else -> {
                openRegion = OpenRegion(marker.copy(region = region))
                scan.position += marker.delimiters.start.length
            }
        }
    }

    private fun scanRegion(scan: LineScan, region: OpenRegion) {
        val marker = region.marker
        when {
            marker.region == Region.QUOTE && syntax.isBackslashEscapeInQuotes && scan.current == ESCAPE -> scan.position += ESCAPE_LENGTH
            isEndAt(scan, marker) -> close(scan, region)
            marker.isNestable && scan.line.startsWith(marker.delimiters.start, scan.position) -> {
                region.depth++
                scan.position += marker.delimiters.start.length
            }
            else -> scan.position++
        }
    }

    private fun isEndAt(scan: LineScan, marker: Marker): Boolean {
        val end = marker.delimiters.end
        if (!scan.line.startsWith(end, scan.position)) return false
        val isFollowedByEndCharacter = scan.line.getOrNull(scan.position + end.length) == end.last()
        return !(marker.closesAtLastOfRun && isFollowedByEndCharacter)
    }

    private fun close(scan: LineScan, region: OpenRegion) {
        region.depth--
        if (region.depth == 0) openRegion = null
        scan.position += region.marker.delimiters.end.length
    }

    private class LineScan(val line: String, regionAtLineStart: Region?) {
        var position = 0
        var hasCode = false
        var hasComment = false
        val current: Char get() = line[position]
        val isAtWordStart: Boolean get() = line.getOrNull(position - 1).let { it == null || it.isWhitespace() || it in WORD_SEPARATORS }

        init {
            regionAtLineStart?.let(::mark)
        }

        fun mark(region: Region) {
            if (region.isComment) hasComment = true else hasCode = true
        }
    }

    private enum class Region(val isComment: Boolean) {
        LINE_COMMENT(true),
        BLOCK_COMMENT(true),
        DOC_QUOTE(true),
        QUOTE(false),
        VERBATIM_QUOTE(false),
        CODE(false)
    }

    private data class Marker(val delimiters: Delimiters, val region: Region, val isNestable: Boolean = false) {
        val closesAtLastOfRun: Boolean
            get() = region != Region.BLOCK_COMMENT &&
                delimiters.end.length >= MIN_QUOTE_RUN &&
                delimiters.end.all { it == delimiters.end.first() }
    }

    private class OpenRegion(val marker: Marker) {
        var depth = 1
    }

    companion object {
        private const val ESCAPE = '\\'
        private const val ESCAPE_LENGTH = 2
        private const val SINGLE_QUOTE = '\''
        private const val HEREDOC_START = '<'
        private const val MIN_QUOTE_RUN = 3
        private const val WORD_SEPARATORS = ";|&()"
        private val REGEX_DELIMITERS = Delimiters("/", "/")
        private val CHAR_LITERAL = Regex("""'(\\.|[^'\\])'""")

        private val CODE_LINE = LineKind(hasCode = true, hasComment = false)
        private val COMMENT_LINE = LineKind(hasCode = false, hasComment = true)
        private val UNMEASURED_LINE = LineKind(hasCode = false, hasComment = false)

        private fun Char.isWordCharacter() = isLetterOrDigit() || this == '_'

        private fun endsWithBackslash(line: String) = line.trimEnd().endsWith(ESCAPE)

        private fun collectMarkers(syntax: LanguageSyntax): List<Marker> = buildList {
            syntax.lineComments.forEach { add(Marker(Delimiters(it, ""), Region.LINE_COMMENT)) }
            syntax.codeMarkers.forEach { add(Marker(Delimiters(it, ""), Region.CODE)) }
            syntax.blockComments.forEach { add(Marker(it, Region.BLOCK_COMMENT)) }
            syntax.nestedBlockComments.forEach { add(Marker(it, Region.BLOCK_COMMENT, isNestable = true)) }
            syntax.docQuotes.forEach { add(Marker(it, Region.DOC_QUOTE)) }
            syntax.quotes.forEach { add(Marker(it, Region.QUOTE)) }
            syntax.verbatimQuotes.forEach { add(Marker(it, Region.VERBATIM_QUOTE)) }
        }
    }
}
