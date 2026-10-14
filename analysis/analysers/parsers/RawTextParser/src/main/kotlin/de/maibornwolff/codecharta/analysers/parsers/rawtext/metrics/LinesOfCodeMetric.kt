package de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics

class LinesOfCodeMetric : Metric {
    private var lineCount = 0

    companion object {
        const val NAME = "LinesOfCode"
    }

    override fun parseLine(line: String) {
        lineCount++
    }

    override fun getValue(): FileMetrics {
        val fileMetrics = FileMetrics()
        fileMetrics.addMetric("loc", lineCount)
        return fileMetrics
    }
}
