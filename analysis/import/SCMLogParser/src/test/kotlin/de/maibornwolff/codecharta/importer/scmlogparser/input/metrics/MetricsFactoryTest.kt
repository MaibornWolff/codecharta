package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.util.Arrays

class MetricsFactoryTest {
    @Test
    fun createMetricsShouldReturnCorrectMetric() {
        val metricName = "abs_code_churn"
        val factory = MetricsFactory(Arrays.asList(metricName))

        val modificationMetrics = factory.createMetrics()

        assertThat(modificationMetrics).hasSize(1)
        assertThat(modificationMetrics[0].metricName()).isSameAs(metricName)
    }

    @Test
    fun nonExistingMetricsShouldBeIgnored() {
        val metricName = "some_non_existing_metric"
        val factory = MetricsFactory(Arrays.asList(metricName))

        assertThat(factory.createMetrics()).hasSize(0)
    }

    @Test
    fun defaultConstructorShouldCreateAllMetrics() {
        val factory = MetricsFactory()

        assertThat(factory.createMetrics()).hasSize(14)
    }
}