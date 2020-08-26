package de.maibornwolff.codecharta.parser.rawtextparser.metrics

import de.maibornwolff.codecharta.parser.rawtextparser.model.FileMetrics

interface Metric {

    val name: String
    val description: String

    fun setParameters(parameters: Map<String, Int>) {
    }

    fun parseLine(line: String)

    fun getValue(): FileMetrics
}
