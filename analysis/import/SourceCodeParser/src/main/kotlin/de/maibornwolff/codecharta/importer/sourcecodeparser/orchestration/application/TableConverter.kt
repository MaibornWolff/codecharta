package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTableRow
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric

fun overviewMetricToTable(folderMetrics: OverviewMetric): String{
    val javaFiles = folderMetrics.languageValue(OopLanguage.JAVA)
    val loc = folderMetrics.metricValue(MetricType.LoC)
    val rloc = folderMetrics.metricValue(MetricType.RLoc)

    return String.format("%-20s %-10s %-10s %-10s", "Language", "Files", "LoC", "RLoC") + "\n" +
            "-".repeat(40)+ "\n" +
            String.format("%-20s %-10d %-10s %-10s", "Java", javaFiles, loc, rloc) + "\n" +
            "-".repeat(40)+ "\n" +
            String.format("%-20s %-10d %-10s %-10s", "SUM:", javaFiles, loc, rloc)

}

fun detailedMetricToTable(detailedMetricTable: DetailedMetricTable): String{
    return String.format("%-5s %-5s %-5s %-120s %-20s", "LoC", "RLoC", "MCC", "Code", "Tags") + "\n" +
            "-".repeat(40)+ "\n" +
            rowsAsText(detailedMetricTable)

}


private fun rowsAsText(detailedMetricTable: DetailedMetricTable): String{
    var previousRow = DetailedMetricTableRow.NULL
    val result = detailedMetricTable.map{
        val rowText = String.format("%-5d %-5s %-5s %-120s %-20s",
                it[MetricType.LoC],
                textToDisplay(it, MetricType.RLoc, previousRow),
                textToDisplay(it, MetricType.MCC, previousRow),
                it.text,
                it.tags)
        previousRow = it
        rowText
    }.joinToString("\n")
    return result
}

private fun textToDisplay(detailedMetricTableRow: DetailedMetricTableRow, metricType: MetricType, previousMetricTableRow: DetailedMetricTableRow): String {
    return if(detailedMetricTableRow.metricWasIncremented(metricType, previousMetricTableRow)) {
        detailedMetricTableRow[metricType].toString()
    } else {
        ""
    }
}
