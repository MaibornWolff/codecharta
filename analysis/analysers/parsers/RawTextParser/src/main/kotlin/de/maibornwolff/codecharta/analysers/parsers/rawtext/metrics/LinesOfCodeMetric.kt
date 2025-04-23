package de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics

import de.maibornwolff.codecharta.analysers.parsers.rawtext.FileMetrics

class LinesOfCodeMetric : Metric {
    private var lineCount = 0

    companion object {
        const val NAME = "loc"
    }

    override fun parseLine(line: String) {
        if (line.isNotBlank()) {
            lineCount++
        }
    }

    override fun getValue(): FileMetrics {
        val fileMetrics = FileMetrics()
        fileMetrics.addMetric("lines_of_code", lineCount)
        return fileMetrics
    }
}
