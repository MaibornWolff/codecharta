package de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics

interface Metric {
    fun parseLine(line: String)

    fun getValue(): FileMetrics
}
