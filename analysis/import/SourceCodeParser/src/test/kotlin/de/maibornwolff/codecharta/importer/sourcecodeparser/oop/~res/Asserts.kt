package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.MetricExtractor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.prettyPrint
import org.assertj.core.api.AbstractAssert
import org.assertj.core.api.Assertions
import org.assertj.core.util.CheckReturnValue


@CheckReturnValue
fun <T> assertThatMetricElement(metricExtractor: MetricExtractor, foo: (metricExtractor: MetricExtractor) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(metricExtractor)).describedAs("\n"+ prettyPrint(metricExtractor) +"\n")
}