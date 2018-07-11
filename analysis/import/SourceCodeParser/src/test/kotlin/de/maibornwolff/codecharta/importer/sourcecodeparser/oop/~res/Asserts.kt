package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.FolderSummary
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application.TableStreamPrinter
import org.assertj.core.api.AbstractAssert
import org.assertj.core.api.Assertions
import org.assertj.core.util.CheckReturnValue


@CheckReturnValue
fun <T> assertThatMetricElement(metricExtractor: MetricTable, foo: (metricTable: MetricTable) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(metricExtractor)).describedAs("\n"+ TableStreamPrinter(System.out).printFile(metricExtractor) +"\n")
}

@CheckReturnValue
fun <T> assertThatMetricElement(folderSummary: FolderSummary, foo: (folderSummary: FolderSummary) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(folderSummary))//.describedAs("\n"+ TableStreamPrinter(System.out))//.printFile(folderSummary) +"\n")
}