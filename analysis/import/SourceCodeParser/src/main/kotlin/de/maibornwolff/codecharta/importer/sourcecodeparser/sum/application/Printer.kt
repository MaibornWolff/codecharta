package de.maibornwolff.codecharta.importer.sourcecodeparser.sum.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.FileMetrics

interface Printer {

    fun printFile(filemetrics: FileMetrics)
    fun printFolder(metrics: List<FileMetrics>)

}