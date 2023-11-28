package de.maibornwolff.codecharta.parser.rawtextparser.metrics

import de.maibornwolff.codecharta.parser.rawtextparser.model.FileMetrics
import mu.KotlinLogging
import java.lang.Integer.min

class IndentationMetric(
    private var maxIndentation: Int,
    private var verbose: Boolean,
    private var tabWidth: Int,
) : Metric {
    private val logger = KotlinLogging.logger {}

    private val spaceIndentations = MutableList(maxIndentation * 8 + 1) { 0 }
    private val tabIndentations = MutableList(maxIndentation + 1) { 0 }

    override val name = "IndentationLevel"
    override val description = "Number of lines with an indentation level of at least x"

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
            logger.info("Assumed tab width to be $tabWidth")
        }
        return tabWidth
    }

    private fun correctMismatchingIndents(tabWidth: Int) {
        for (i in spaceIndentations.indices) {
            if (i % tabWidth != 0 && spaceIndentations[i] > 0) {
                val nextLevel: Int = i / tabWidth + 1
                spaceIndentations[nextLevel * tabWidth] = spaceIndentations[nextLevel * tabWidth] + spaceIndentations[i]
                logger.warn("Corrected mismatching indentations, moved ${spaceIndentations[i]} lines to indentation level $nextLevel+")
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
