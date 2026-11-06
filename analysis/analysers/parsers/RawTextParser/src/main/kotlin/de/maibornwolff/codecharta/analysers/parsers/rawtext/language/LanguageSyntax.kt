package de.maibornwolff.codecharta.analysers.parsers.rawtext.language

data class LanguageSyntax(
    val lineComments: List<String> = emptyList(),
    val blockComments: List<Delimiters> = emptyList(),
    val nestedBlockComments: List<Delimiters> = emptyList(),
    val quotes: List<Delimiters> = emptyList(),
    val verbatimQuotes: List<Delimiters> = emptyList(),
    val docQuotes: List<Delimiters> = emptyList(),
    val codeMarkers: List<String> = emptyList(),
    val heredocOpeners: List<HeredocOpener> = emptyList(),
    val isLineCommentOnlyAtWordStart: Boolean = false,
    val isBackslashEscapeInCode: Boolean = false,
    val isBackslashEscapeInQuotes: Boolean = true,
    val isLineCommentContinuedByBackslash: Boolean = false,
    val isDocStringAStatement: Boolean = false,
    val regexLiteral: RegexLiteral? = null,
    val percentLiteral: PercentLiteral? = null,
    val templateLiteral: TemplateLiteral? = null,
    val dataSectionMarker: String? = null,
    val measuredBlock: MeasuredBlock? = null
)

class MeasuredBlock(startPattern: String, private val end: String) {
    private val start = Regex(startPattern)

    fun opensAt(line: String) = start.containsMatchIn(line)

    fun closesAt(line: String) = line.contains(end)
}

class HeredocOpener(pattern: String) {
    private val regex = Regex(pattern)

    fun terminatorAt(line: String, position: Int): HeredocMatch? {
        val match = regex.matchAt(line, position) ?: return null
        return HeredocMatch(match.groupValues[TERMINATOR_GROUP], match.value.length)
    }

    companion object {
        private const val TERMINATOR_GROUP = 2
    }
}

data class HeredocMatch(val terminator: String, val openerLength: Int)

data class TemplateLiteral(val quote: String, val placeholderStart: String)
