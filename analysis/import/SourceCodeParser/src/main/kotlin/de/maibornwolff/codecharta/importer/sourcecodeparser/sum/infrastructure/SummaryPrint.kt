package de.maibornwolff.codecharta.importer.sourcecodeparser.sum.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.MetricExtractor

fun prettySummary(metrics: List<MetricExtractor>): String{
    var javaFiles = metrics.size
    var loc = 0
    var rloc = 0

    metrics.forEach {
        loc += it.loc()
        rloc += it.rloc()
    }

    return String.format("%-20s %-10s %-10s %-10s", "Language", "Files", "LoC", "RLoC") + "\n" +
            "-".repeat(40)+ "\n" +
            String.format("%-20s %-10d %-10s %-10s", "Java", javaFiles, loc, rloc) + "\n" +
            "-".repeat(40)+ "\n" +
            String.format("%-20s %-10d %-10s %-10s", "SUM:", javaFiles, loc, rloc)

}