package de.maibornwolff.codecharta.parser.rawtextparser.metrics

import de.maibornwolff.codecharta.parser.rawtextparser.model.FileMetrics
import de.maibornwolff.codecharta.parser.rawtextparser.model.toBool
import java.io.PrintStream
import java.lang.Integer.min

class IndentationCounter(
    private var maxIndentation: Int = 6,
    private var stderr: PrintStream = System.err,
    private var verbose: Boolean = false,
    private var tabWidth: Int = 0
) : Metric {
    private val spaceIndentations = MutableList(maxIndentation * 8 + 1) { 0 }
    private val tabIndentations = MutableList(maxIndentation + 1) { 0 }
    override val name = "IndentationLevel"
    override val description = "Number of lines with an indentation level of at least x"
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

    override fun setParameters(parameters: Map<String, Int>) {
        maxIndentation = parameters["maxIndentationLevel"] ?: maxIndentation
        tabWidth = parameters["tabWidth"] ?: tabWidth
        verbose = parameters["verbose"]?.toBool() ?: verbose
    }

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
        if (verbose) stderr.println("INFO: Assumed tab width to be $tabWidth")
        return tabWidth
    }

    private fun correctMismatchingIndents(tabWidth: Int) {
        for (i in spaceIndentations.indices) {
            if (i % tabWidth != 0 && spaceIndentations[i] > 0) {
                val nextLevel: Int = i / tabWidth + 1
                spaceIndentations[nextLevel * tabWidth] = spaceIndentations[nextLevel * tabWidth] + spaceIndentations[i]
                stderr.println("WARN: Corrected mismatching indentations, moved ${spaceIndentations[i]} lines to indentation level $nextLevel+")
                spaceIndentations[i] = 0
            }
        }
    }

    override fun getValue(): FileMetrics {
        if (tabWidth == 0) {
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