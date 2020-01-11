package de.maibornwolff.codecharta.importer.rawtextparser.metrics

import de.maibornwolff.codecharta.importer.rawtextparser.model.FileMetrics

interface Metric {

    val name: String
    val description: String

    fun setParameters(parameters: Map<String, Int>) {

    }

    fun parseLine(line: String)

    fun getValue(): FileMetrics

}