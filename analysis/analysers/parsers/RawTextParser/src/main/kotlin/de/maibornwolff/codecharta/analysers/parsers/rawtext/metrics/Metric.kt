package de.maibornwolff.codecharta.analysers.parsers.rawtext.metrics

import de.maibornwolff.codecharta.analysers.parsers.rawtext.FileMetrics

interface Metric {
    fun parseLine(line: String)

    fun getValue(): FileMetrics
}
