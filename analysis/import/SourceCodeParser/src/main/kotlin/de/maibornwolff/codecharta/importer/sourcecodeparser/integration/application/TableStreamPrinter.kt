package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTableRow
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import java.io.PrintStream


class TableStreamPrinter(private val outputStream: PrintStream): Printer {

    override fun printFile(detailedMetricTable: DetailedMetricTable) {
        outputStream.println(fileMetricToTabular(detailedMetricTable))
    }

    override fun printFolder(folderMetrics: OverviewMetric) {
        outputStream.println(folderMetricsToTabular(folderMetrics))
    }

    private fun folderMetricsToTabular(folderMetrics: OverviewMetric): String{
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

fun fileMetricToTabular(detailedMetricTable: DetailedMetricTable): String{
    return String.format("%-5s %-5s %-120s %-20s", "LoC", "RLoC", "Code", "Tags") + "\n" +
            "-".repeat(40)+ "\n" +
            rowsAsText(detailedMetricTable)

}

private fun rowsAsText(detailedMetricTable: DetailedMetricTable): String{
    var previousRow = DetailedMetricTableRow.NULL
    val result = detailedMetricTable.map{
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

private fun rlocText(detailedMetricTableRow: DetailedMetricTableRow, rowMetricWasIncremented: Boolean) = if(rowMetricWasIncremented) detailedMetricTableRow[MetricType.RLoc].toString() else ""
