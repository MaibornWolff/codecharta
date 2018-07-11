package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics
import org.assertj.core.api.Assertions
import org.junit.Test
import java.io.IOException

class MetricExtractorSimpleClassTest {

    @Test(expected = IndexOutOfBoundsException::class)
    @Throws(IOException::class)
    fun trying_index_0_results_in_exceptions_because_code_starts_at_line_1() {
        val name = "SourceCodeSimple.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = DetailedSourceProviderStub.javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        singleMetrics[0]
    }

    @Test
    @Throws(IOException::class)
    fun trying_last_index_does_not_result_in_exception() {
        val name = "SourceCodeSimple.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = DetailedSourceProviderStub.javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        singleMetrics[singleMetrics.rowCount()]
    }

    @Test
    @Throws(IOException::class)
    fun does_not_count_empty_line_as_real() {
        val name = "SourceCodeSimple.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = DetailedSourceProviderStub.javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        Assertions.assertThat(singleMetrics[1][MetricType.RLoc]).isEqualTo(1)
        Assertions.assertThat(singleMetrics[2][MetricType.RLoc]).isEqualTo(1)
        Assertions.assertThat(singleMetrics[2].metricWasIncremented(MetricType.RLoc, singleMetrics[1])).isFalse()
        Assertions.assertThat(singleMetrics[3][MetricType.RLoc]).isEqualTo(2)
        Assertions.assertThat(singleMetrics[3].metricWasIncremented(MetricType.RLoc, singleMetrics[2])).isTrue()
    }

    @Test
    @Throws(IOException::class)
    fun does_not_count_comment_line_as_real() {
        val name = "SourceCodeSimple.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = DetailedSourceProviderStub.javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        Assertions.assertThat(singleMetrics[8][MetricType.RLoc]).isEqualTo(3)
        Assertions.assertThat(singleMetrics[9][MetricType.RLoc]).isEqualTo(4)
    }

    @Test
    @Throws(IOException::class)
    fun does_not_count_lines_with_only_a_bracket_as_real() {
        val name = "SourceCodeSimple.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = DetailedSourceProviderStub.javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        Assertions.assertThat(singleMetrics[19][MetricType.RLoc]).isEqualTo(10)
        Assertions.assertThat(singleMetrics[20][MetricType.RLoc]).isEqualTo(10)
    }

    @Test
    @Throws(IOException::class)
    fun counts_all_lines_as_lines_of_code() {
        val name = "SourceCodeSimple.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = DetailedSourceProviderStub.javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        Assertions.assertThat(singleMetrics.rowCount()).isEqualTo(43)
    }

    @Test
    @Throws(IOException::class)
    fun counts_only_lines_with_actual_value_as_real() {
        val name = "SourceCodeSimple.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = DetailedSourceProviderStub.javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        Assertions.assertThat(singleMetrics[43][MetricType.RLoc]).isEqualTo(25)
    }
}