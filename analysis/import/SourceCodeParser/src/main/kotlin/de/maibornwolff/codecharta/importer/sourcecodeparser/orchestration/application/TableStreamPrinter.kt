package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTableRow
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopLanguage
import java.io.PrintStream


class TableStreamPrinter(private val outputStream: PrintStream): Printer {

    override fun printDetails(detailedMetricTable: DetailedMetricTable) {
        outputStream.println(detailedMetricToTable(detailedMetricTable))
    }

    override fun printOverview(overviewMetric: OverviewMetric) {
        outputStream.println(overviewMetricToTable(overviewMetric))
    }


}

