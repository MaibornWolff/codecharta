package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.TableStreamPrinter
import org.assertj.core.api.AbstractAssert
import org.assertj.core.api.Assertions
import org.assertj.core.util.CheckReturnValue


@CheckReturnValue
fun <T> assertThatMetricElement(detailedMetricTable: DetailedMetricTable, foo: (detailedMetricTable: DetailedMetricTable) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(detailedMetricTable)).describedAs("\n"+ TableStreamPrinter(System.out).printFile(detailedMetricTable) +"\n")
}

@CheckReturnValue
fun <T> assertThatMetricElement(folderSummary: OverviewMetric, foo: (folderSummary: OverviewMetric) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(folderSummary))//.describedAs("\n"+ TableStreamPrinter(System.out))//.printFile(folderSummary) +"\n")
}