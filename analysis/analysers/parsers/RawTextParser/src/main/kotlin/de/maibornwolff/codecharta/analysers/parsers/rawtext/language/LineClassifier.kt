package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

data class LineKind(val hasCode: Boolean, val hasComment: Boolean)

class LineClassifier(private val syntax: LanguageSyntax) {
    private val markers = Marker.allOf(syntax)
    private val isSingleQuoteCharLiteral = markers.none { it.delimiters.start.startsWith(SINGLE_QUOTE) }
    private val heredocs = HeredocTracker(syntax.heredocOpeners)
    private val measuredBlock = MeasuredBlockTracker(syntax.measuredBlock)
    private var openRegion: OpenRegion? = null
    private var isInDataSection = false
    private var isLineCommentContinued = false
    private var isFirstLine = true
    private val statement = if (syntax.isDocStringAStatement) StatementTracker() else null
    private val placeholders = TemplatePlaceholders<OpenRegion>()

    fun classify(line: String): LineKind = classifyContent(if (isFirstLine) withoutByteOrderMark(line) else line)

    private fun withoutByteOrderMark(line: String): String {
        isFirstLine = false
        return line.removePrefix(BYTE_ORDER_MARK)
    }

    private fun classifyContent(line: String): LineKind = when {
        !measuredBlock.isMeasured(line) -> UNMEASURED_LINE
        isInDataSection -> CODE_LINE
        heredocs.isInBody -> classifyHeredocBody(line)
        isLineCommentContinued -> classifyContinuedLineComment(line)
        isDataSectionStart(line) -> startDataSection()
        else -> scanLine(line)
    }

    private fun scanLine(line: String): LineKind {
        val scan = LineScan(line, openRegion?.marker?.region)
        statement?.startLine()
        while (scan.position < line.length) {
            val region = openRegion
            if (region == null) scanCode(scan) else scanRegion(scan, region)
        }
        statement?.endLine(isInsideRegion = openRegion != null)
        val isDocStringFollowedByCode = scan.isDocStringOpenedOnLine && scan.hasCode
        return if (isDocStringFollowedByCode) {
            LineKind(
                hasCode = true,
                hasComment = scan.hasCommentBesideDocString
            )
        } else {
            LineKind(scan.hasCode, scan.hasComment)
        }
    }

    private fun classifyHeredocBody(line: String): LineKind {
        heredocs.readBodyLine(line)
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
        if (resumeTemplate(scan) || openHeredoc(scan) || openPercentLiteral(scan) || openMultiLineRegex(scan)) return
        val marker = markers.firstOrNull { isMarkerAt(scan, it) }
        if (marker == null) {
            scan.hasCode = true
            statement?.trackCode(scan.current)
            scan.position += plainCodeLengthAt(scan)
            return
        }
        open(scan, marker)
    }

    private fun resumeTemplate(scan: LineScan): Boolean {
        val template = placeholders.templateResumedBy(scan.current) ?: return false
        openRegion = template
        scan.hasCode = true
        scan.position++
        return true
    }

    private fun openHeredoc(scan: LineScan): Boolean {
        val openerLength = heredocs.openerLengthAt(scan.line, scan.position) ?: return false
        scan.hasCode = true
        scan.position += openerLength
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
        if (!scan.startsWith(marker.delimiters.start)) return false
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
        val region = regionOpenedBy(scan, marker)
        if (region == Region.DOC_QUOTE) scan.isDocStringOpenedOnLine = true
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

    private fun regionOpenedBy(scan: LineScan, marker: Marker): Region {
        val isAtStatementStart = !scan.hasCode && statement?.isAtStatementStart != false
        return when {
            marker.region == Region.DOC_QUOTE && !isAtStatementStart -> Region.QUOTE
            marker.region == Region.QUOTE && statement != null && isAtStatementStart -> Region.DOC_QUOTE
            else -> marker.region
        }
    }

    private fun scanRegion(scan: LineScan, region: OpenRegion) {
        val marker = region.marker
        when {
            marker.region.isQuote && syntax.isBackslashEscapeInQuotes && scan.current == ESCAPE -> scan.position += ESCAPE_LENGTH
            isPlaceholderStartAt(scan, marker) -> enterPlaceholder(scan, region)
            marker.endsAt(scan) -> close(scan, region)
            marker.isNestable && scan.startsWith(marker.delimiters.start) -> {
                region.depth++
                scan.position += marker.delimiters.start.length
            }
            else -> scan.position++
        }
    }

    private fun isPlaceholderStartAt(scan: LineScan, marker: Marker): Boolean {
        val template = syntax.templateLiteral ?: return false
        return marker.delimiters.start == template.quote && scan.startsWith(template.placeholderStart)
    }

    private fun enterPlaceholder(scan: LineScan, region: OpenRegion) {
        placeholders.enter(region)
        openRegion = null
        scan.position += checkNotNull(syntax.templateLiteral).placeholderStart.length
    }

    private fun close(scan: LineScan, region: OpenRegion) {
        region.depth--
        if (region.depth == 0) openRegion = null
        scan.position += region.marker.delimiters.end.length
    }

    companion object {
        private const val ESCAPE = '\\'
        private const val BYTE_ORDER_MARK = "\uFEFF"
        private const val ESCAPE_LENGTH = 2
        private const val SINGLE_QUOTE = '\''
        private val REGEX_DELIMITERS = Delimiters("/", "/")
        private val CHAR_LITERAL = Regex("""'(\\.|[^'\\])'""")

        private val CODE_LINE = LineKind(hasCode = true, hasComment = false)
        private val COMMENT_LINE = LineKind(hasCode = false, hasComment = true)
        private val UNMEASURED_LINE = LineKind(hasCode = false, hasComment = false)

        private fun endsWithBackslash(line: String) = line.trimEnd().endsWith(ESCAPE)
    }
}
