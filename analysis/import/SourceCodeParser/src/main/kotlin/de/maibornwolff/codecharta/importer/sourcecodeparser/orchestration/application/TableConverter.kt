package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTableRow
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric

private const val overviewMetricTableFormat = "%-20s %-10s %-10s %-10s"

fun overviewMetricToTable(folderMetrics: OverviewMetric): String {
    val javaFiles = folderMetrics.languageValue(OopLanguage.JAVA)
    val loc = folderMetrics.metricValue(MetricType.LoC)
    val rloc = folderMetrics.metricValue(MetricType.RLoc)

    return String.format(overviewMetricTableFormat, "Language", "Files", "LoC", "RLoC") + "\n" +
            "-".repeat(40) + "\n" +
            String.format(overviewMetricTableFormat, "Java", javaFiles, loc, rloc) + "\n" +
            "-".repeat(40) + "\n" +
            String.format(overviewMetricTableFormat, "SUM:", javaFiles, loc, rloc)

}

private const val detailedMetricTableFormat = "%-5s %-5s %-5s %-120s"

fun detailedMetricToTable(detailedMetricTable: DetailedMetricTable): String {
    return String.format(detailedMetricTableFormat, "LoC", "RLoC", "MCC", "Code") + "\n" +
            "-".repeat(40) + "\n" +
            rowsAsText(detailedMetricTable)

}


private fun rowsAsText(detailedMetricTable: DetailedMetricTable): String {
    var previousRow = DetailedMetricTableRow.NULL
    val result = detailedMetricTable.map {
        val rowText = String.format(detailedMetricTableFormat,
                it[MetricType.LoC],
                textToDisplay(it, MetricType.RLoc, previousRow),
                textToDisplay(it, MetricType.MCC, previousRow),
                it.text)
        previousRow = it
        rowText
    }.joinToString("\n")
    return result
}

private fun textToDisplay(detailedMetricTableRow: DetailedMetricTableRow, metricType: MetricType, previousMetricTableRow: DetailedMetricTableRow): String {
    return if (detailedMetricTableRow.metricWasIncremented(metricType, previousMetricTableRow)) {
        detailedMetricTableRow[metricType].toString()
    } else {
        ""
    }
}
