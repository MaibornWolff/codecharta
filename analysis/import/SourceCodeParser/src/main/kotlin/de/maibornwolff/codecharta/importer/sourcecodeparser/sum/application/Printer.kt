package de.maibornwolff.codecharta.importer.sourcecodeparser.sum.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.RowMetrics

interface Printer {

    fun printFile(filemetrics: RowMetrics)
    fun printFolder(metrics: List<RowMetrics>)

}