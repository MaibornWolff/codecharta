package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.TableStreamPrinter
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.detailedMetricToTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.overviewMetricToTable
import org.assertj.core.api.AbstractAssert
import org.assertj.core.api.Assertions
import org.assertj.core.util.CheckReturnValue


@CheckReturnValue
fun <T> assertWithPrintOnFail(detailedMetricTable: DetailedMetricTable, foo: (detailedMetricTable: DetailedMetricTable) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(detailedMetricTable)).describedAs("\n"+ detailedMetricToTable(detailedMetricTable) +"\n")
}

@CheckReturnValue
fun <T> assertWithPrintOnFail(overviewMetric: OverviewMetric, foo: (overviewMetric: OverviewMetric) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(overviewMetric)).describedAs("\n"+ overviewMetricToTable(overviewMetric) +"\n")
}