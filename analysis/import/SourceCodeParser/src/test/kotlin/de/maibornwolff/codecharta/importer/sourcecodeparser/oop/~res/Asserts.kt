package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.TablePrinter
import org.assertj.core.api.AbstractAssert
import org.assertj.core.api.Assertions
import org.assertj.core.util.CheckReturnValue


@CheckReturnValue
fun <T> assertThatMetricElement(metricExtractor: MetricTable, foo: (metricExtractor: MetricTable) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(metricExtractor)).describedAs("\n"+ TablePrinter(System.out).printFile(metricExtractor) +"\n")
}