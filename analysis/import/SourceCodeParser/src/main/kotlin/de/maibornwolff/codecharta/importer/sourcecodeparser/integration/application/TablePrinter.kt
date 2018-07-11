package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.FolderSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.Row
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import java.io.PrintStream


class TablePrinter(private val outputStream: PrintStream): Printer {

    override fun printFile(metricTable: MetricTable) {
        outputStream.println(fileMetricToTabular(metricTable))
    }

    override fun printFolder(folderMetrics: FolderSummary) {
        outputStream.println(folderMetricsToTabular(folderMetrics))
    }

    private fun folderMetricsToTabular(folderMetrics: FolderSummary): String{
        val javaFiles = folderMetrics.languageValue(OopLanguage.JAVA)
        var loc = folderMetrics.metricValue(MetricType.LoC)
        var rloc = folderMetrics.metricValue(MetricType.RLoc)

        return String.format("%-20s %-10s %-10s %-10s", "Language", "Files", "LoC", "RLoC") + "\n" +
                "-".repeat(40)+ "\n" +
                String.format("%-20s %-10d %-10s %-10s", "Java", javaFiles, loc, rloc) + "\n" +
                "-".repeat(40)+ "\n" +
                String.format("%-20s %-10d %-10s %-10s", "SUM:", javaFiles, loc, rloc)

    }
}

fun fileMetricToTabular(metricTable: MetricTable): String{
    return String.format("%-5s %-5s %-120s %-20s", "LoC", "RLoC", "Code", "Tags") + "\n" +
            "-".repeat(40)+ "\n" +
            rowsAsText(metricTable)

}

private fun rowsAsText(metricTable: MetricTable): String{
    var previousRow = Row.NULL
    val result = metricTable.map{
        val rowText = String.format("%-5d %-5s %-120s %-20s",
                it[MetricType.LoC],
                rlocText(it, it.metricWasIncremented(MetricType.RLoc, previousRow)),
                it.text,
                it.tags)
        previousRow = it
        rowText
    }.joinToString("\n")
    return result
}

private fun rlocText(row: Row, rowMetricWasIncremented: Boolean)=  if(rowMetricWasIncremented) row[MetricType.RLoc].toString() else ""
