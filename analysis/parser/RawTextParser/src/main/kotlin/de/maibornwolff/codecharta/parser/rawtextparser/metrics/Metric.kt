package de.maibornwolff.codecharta.parser.rawtextparser.metrics

interface Metric {

    val name: String
    val description: String

    fun parseLine(line: String)

    fun getValue(): FileMetrics
}
