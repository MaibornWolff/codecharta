package de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LineClassifier

class CodeAndCommentLinesMetric(syntax: LanguageSyntax) : Metric {
    private val classifier = LineClassifier(syntax)
    private var realLinesOfCode = 0
    private var commentLines = 0

    companion object {
        const val NAME = "CodeAndCommentLines"
        const val REAL_LINES_OF_CODE = "rloc"
        const val COMMENT_LINES = "comment_lines"
    }

    override fun parseLine(line: String) {
        val kind = classifier.classify(line)
        if (kind.hasCode) realLinesOfCode++
        if (kind.hasComment) commentLines++
    }

    override fun getValue(): FileMetrics = FileMetrics()
        .addMetric(REAL_LINES_OF_CODE, realLinesOfCode)
        .addMetric(COMMENT_LINES, commentLines)
}
