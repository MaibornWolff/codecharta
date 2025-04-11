package de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics

import de.maibornwolff.codecharta.analysers.parsers.rawtext.FileMetrics
import de.maibornwolff.codecharta.util.Logger
import java.lang.Integer.min

class IndentationMetric(
    private var maxIndentation: Int,
    private var verbose: Boolean,
    private var tabWidth: Int
) : Metric {
    private val spaceIndentations = MutableList(maxIndentation * 8 + 1) { 0 }
    private val tabIndentations = MutableList(maxIndentation + 1) { 0 }

    companion object {
        const val NAME = "IndentationLevel"
    }

    // TODO no mixed tab/ space possible at line start?
    override fun parseLine(line: String) {
        var tabIndent = line.length - line.trimStart('\t').length
        var spaceIndent = line.length - line.trimStart(' ').length
        if (spaceIndent == line.length || tabIndent == line.length) return

        if (spaceIndent > 0) {
            spaceIndent = min(spaceIndent, 8 * maxIndentation)
            spaceIndentations[spaceIndent] = spaceIndentations[spaceIndent] + 1
        } else {
            tabIndent = min(tabIndent, maxIndentation)
            tabIndentations[tabIndent] = tabIndentations[tabIndent] + 1
        }
    }

    // TODO tabSize - (offset % tabSize) from the current position
    private fun guessTabWidth(): Int {
        tabWidth = 1
        if (spaceIndentations.sum() == 0) return tabWidth

        val candidates = 2..8
        candidates.forEach { candidate ->
            var mismatches = 0
            for (i in spaceIndentations.indices) {
                if (i % candidate != 0) {
                    mismatches += spaceIndentations[i]
                }
            }
            if (mismatches == 0) {
                tabWidth = candidate
            }
        }
        if (verbose) {
            Logger.info { "Assumed tab width to be $tabWidth" }
        }
        return tabWidth
    }

    private fun correctMismatchingIndents(tabWidth: Int) {
        for (i in spaceIndentations.indices) {
            if (i % tabWidth != 0 && spaceIndentations[i] > 0) {
                val nextLevel: Int = i / tabWidth + 1
                spaceIndentations[nextLevel * tabWidth] = spaceIndentations[nextLevel * tabWidth] + spaceIndentations[i]
                Logger.warn { "Corrected mismatching indentations, moved ${spaceIndentations[i]} lines to indentation level $nextLevel+" }
                spaceIndentations[i] = 0
            }
        }
    }

    override fun getValue(): FileMetrics {
        if (tabWidth <= 0) {
            guessTabWidth()
        }
        correctMismatchingIndents(tabWidth)

        val fileMetrics = FileMetrics()
        for (i in 0..maxIndentation) {
            val tabVal = tabIndentations.subList(i, tabIndentations.size).sum()
            val spaceVal = spaceIndentations.subList(i * tabWidth, spaceIndentations.size).sum()
            val name = "indentation_level_$i+"
            fileMetrics.addMetric(name, tabVal + spaceVal)
        }

        return fileMetrics
    }
}
