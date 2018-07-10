package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.Printer
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.Row
import java.io.PrintStream


class TablePrinter(private val outputStream: PrintStream): Printer {

    override fun printFile(rowMetrics: MetricTable) {
        outputStream.println(fileMetricToTabular(rowMetrics))
    }

    override fun printFolder(metrics: List<MetricTable>) {
        outputStream.println(folderMetricsToTabular(metrics))
    }

    private fun folderMetricsToTabular(metrics: List<MetricTable>): String{
        val javaFiles = metrics.size
        var loc = 0
        var rloc = 0

        metrics.forEach {
            val summary = it.summary()
            loc += summary[MetricType.LoC]
            rloc += summary[MetricType.RLoc]
        }

        return String.format("%-20s %-10s %-10s %-10s", "Language", "Files", "LoC", "RLoC") + "\n" +
                "-".repeat(40)+ "\n" +
                String.format("%-20s %-10d %-10s %-10s", "Java", javaFiles, loc, rloc) + "\n" +
                "-".repeat(40)+ "\n" +
                String.format("%-20s %-10d %-10s %-10s", "SUM:", javaFiles, loc, rloc)

    }
}



fun fileMetricToTabular(metricExtractor: MetricTable): String{
    return String.format("%-5s %-5s %-120s %-20s", "LoC", "RLoC", "Code", "Tags") + "\n" +
            "-".repeat(40)+ "\n" +
            metricExtractor.map { String.format("%-5d %-5s %-120s %-20s", it[MetricType.LoC], rlocText(it), it.text, it.tags) }.joinToString("\n")
}

private fun rlocText(row: Row) = if(row.rlocWasIncremented) row[MetricType.RLoc] else ""