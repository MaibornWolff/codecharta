package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric
import java.io.Writer


class TableMetricWriter(private val writer: Writer) : MetricWriter {

    override fun printDetails(detailedMetricTable: DetailedMetricTable) {
        writer.write(detailedMetricToTable(detailedMetricTable))
        writer.flush()
    }

    override fun printOverview(overviewMetric: OverviewMetric) {
        writer.write(overviewMetricToTable(overviewMetric))
        writer.flush()
    }


}

