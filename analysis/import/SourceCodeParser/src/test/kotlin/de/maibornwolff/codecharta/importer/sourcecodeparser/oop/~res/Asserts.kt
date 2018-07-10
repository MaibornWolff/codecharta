package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.RowMetrics
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.ConsolePrinter
import org.assertj.core.api.AbstractAssert
import org.assertj.core.api.Assertions
import org.assertj.core.util.CheckReturnValue


@CheckReturnValue
fun <T> assertThatMetricElement(metricExtractor: RowMetrics, foo: (metricExtractor: RowMetrics) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(metricExtractor)).describedAs("\n"+ ConsolePrinter(System.out).printFile(metricExtractor) +"\n")
}