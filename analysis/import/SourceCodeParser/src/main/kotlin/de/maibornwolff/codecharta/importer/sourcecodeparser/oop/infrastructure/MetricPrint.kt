package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.MetricExtractor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.Row

fun prettyPrint(metricExtractor: MetricExtractor): String{
    return String.format("%-5s %-5s %-120s %-20s", "LoC", "RLoC", "Code", "Tags") + "\n" +
        "-".repeat(40)+ "\n" +
        metricExtractor.map { String.format("%-5d %-5s %-120s %-20s", it.loc, rlocText(it), it.text, it.tags) }.joinToString("\n")
}

private fun rlocText(row: Row) = if(row.rlocWasIncremented) row.rloc else ""