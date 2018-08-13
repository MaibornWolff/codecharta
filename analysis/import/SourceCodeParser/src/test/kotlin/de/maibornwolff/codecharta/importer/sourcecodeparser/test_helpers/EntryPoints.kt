package de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.DetailedMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.AntlrJavaCodeTagProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.DetailedSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.MetricCalculator
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.OverviewSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.detailedMetricToTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.domain.metrics.OverviewMetric
import org.assertj.core.api.Assertions.assertThat
import java.io.ByteArrayOutputStream
import java.io.PrintStream

fun calculateDetailedMetrics(detailedSourceProvider: DetailedSourceProvider): DetailedMetricTable {
    return MetricCalculator(AntlrJavaCodeTagProvider(System.err)).calculateDetailedMetrics(detailedSourceProvider)
}

fun calculateDetailedMetricsWithFailOnParseError(detailedSourceProvider: DetailedSourceProvider): DetailedMetricTable {
    val baOutputStream = ByteArrayOutputStream()
    val printStream = PrintStream(baOutputStream)

    val result = MetricCalculator(AntlrJavaCodeTagProvider(printStream)).calculateDetailedMetrics(detailedSourceProvider)

    assertThat(baOutputStream.toString()).describedAs("\n" + detailedMetricToTable(result)).isEmpty()

    return result
}

fun calculateDetailedMetricsWithIgnoreParseError(detailedSourceProvider: DetailedSourceProvider): DetailedMetricTable {
    val baOutputStream = ByteArrayOutputStream()
    val printStream = PrintStream(baOutputStream)

    return MetricCalculator(AntlrJavaCodeTagProvider(printStream)).calculateDetailedMetrics(detailedSourceProvider)
}

fun calculateOverviewMetricsWithFailOnParseError(overviewSourceProvider: OverviewSourceProvider): OverviewMetric {
    val baOutputStream = ByteArrayOutputStream()
    val printStream = PrintStream(baOutputStream)

    val result = MetricCalculator(AntlrJavaCodeTagProvider(printStream)).calculateOverviewMetrics(overviewSourceProvider)

    assertThat(baOutputStream.toString()).isEmpty()

    return result
}