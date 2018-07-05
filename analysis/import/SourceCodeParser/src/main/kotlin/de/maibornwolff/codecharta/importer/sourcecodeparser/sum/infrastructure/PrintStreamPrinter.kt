package de.maibornwolff.codecharta.importer.sourcecodeparser.sum.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.FileMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.Row
import de.maibornwolff.codecharta.importer.sourcecodeparser.sum.application.Printer
import java.io.PrintStream


class PrintStreamPrinter(private val outputStream: PrintStream): Printer {

    override fun printFile(fileMetrics: FileMetrics) {
        outputStream.println(fileMetricToTabular(fileMetrics))
    }

    override fun printFolder(metrics: List<FileMetrics>) {
        outputStream.println(folderMetricsToTabular(metrics))
    }

    private fun folderMetricsToTabular(metrics: List<FileMetrics>): String{
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
}



fun fileMetricToTabular(metricExtractor: FileMetrics): String{
    return String.format("%-5s %-5s %-120s %-20s", "LoC", "RLoC", "Code", "Tags") + "\n" +
            "-".repeat(40)+ "\n" +
            metricExtractor.map { String.format("%-5d %-5s %-120s %-20s", it.loc, rlocText(it), it.text, it.tags) }.joinToString("\n")
}

private fun rlocText(row: Row) = if(row.rlocWasIncremented) row.rloc else ""