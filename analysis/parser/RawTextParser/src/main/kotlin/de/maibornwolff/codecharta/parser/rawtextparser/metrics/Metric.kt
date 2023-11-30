package de.maibornwolff.codecharta.parser.rawtextparser.metrics

import de.maibornwolff.codecharta.parser.rawtextparser.FileMetrics

interface Metric {

    fun parseLine(line: String)

    fun getValue(): FileMetrics
}
