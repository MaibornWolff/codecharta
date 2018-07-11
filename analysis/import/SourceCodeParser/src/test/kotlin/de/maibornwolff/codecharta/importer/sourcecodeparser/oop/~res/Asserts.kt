package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MultiMetric
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.SingleMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.TableStreamPrinter
import org.assertj.core.api.AbstractAssert
import org.assertj.core.api.Assertions
import org.assertj.core.util.CheckReturnValue


@CheckReturnValue
fun <T> assertThatMetricElement(singleMetricTable: SingleMetricTable, foo: (singleMetricTable: SingleMetricTable) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(singleMetricTable)).describedAs("\n"+ TableStreamPrinter(System.out).printFile(singleMetricTable) +"\n")
}

@CheckReturnValue
fun <T> assertThatMetricElement(folderSummary: MultiMetric, foo: (folderSummary: MultiMetric) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(folderSummary))//.describedAs("\n"+ TableStreamPrinter(System.out))//.printFile(folderSummary) +"\n")
}