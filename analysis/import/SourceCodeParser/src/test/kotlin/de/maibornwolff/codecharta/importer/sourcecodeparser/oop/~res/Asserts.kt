package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.FileMetrics
import org.assertj.core.api.AbstractAssert
import org.assertj.core.api.Assertions
import org.assertj.core.util.CheckReturnValue


@CheckReturnValue
fun <T> assertThatMetricElement(metricExtractor: FileMetrics, foo: (metricExtractor: FileMetrics) -> T): AbstractAssert<*, T> {
    return Assertions.assertThat(foo(metricExtractor)).describedAs("\n"+ (metricExtractor) +"\n")
}