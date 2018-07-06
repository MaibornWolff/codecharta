package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.Metric
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.RowMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.Row
import java.io.PrintStream


class PrintStreamPrinter(private val outputStream: PrintStream): Printer {

    override fun printFile(rowMetrics: RowMetrics) {
        outputStream.println(fileMetricToTabular(rowMetrics))
    }

    override fun printFolder(metrics: List<RowMetrics>) {
        outputStream.println(folderMetricsToTabular(metrics))
    }

    private fun folderMetricsToTabular(metrics: List<RowMetrics>): String{
        val javaFiles = metrics.size
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
}



fun fileMetricToTabular(metricExtractor: RowMetrics): String{
    return String.format("%-5s %-5s %-120s %-20s", "LoC", "RLoC", "Code", "Tags") + "\n" +
            "-".repeat(40)+ "\n" +
            metricExtractor.map { String.format("%-5d %-5s %-120s %-20s", it.metrics[Metric.LoC], rlocText(it), it.text, it.tags) }.joinToString("\n")
}

private fun rlocText(row: Row) = if(row.rlocWasIncremented) row[Metric.RLoc] else ""