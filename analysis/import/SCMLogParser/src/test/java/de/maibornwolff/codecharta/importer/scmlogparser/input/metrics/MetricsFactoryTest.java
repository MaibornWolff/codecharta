package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class MetricsFactoryTest {
    @Test
    public void createMetricsShouldReturnCorrectMetric() {
        String metricName = "abs_code_churn";
        MetricsFactory factory = new MetricsFactory(Arrays.asList(metricName));

        List<Metric> modificationMetrics = factory.createMetrics();

        assertThat(modificationMetrics).hasSize(1);
        assertThat(modificationMetrics.get(0).metricName()).isSameAs(metricName);
    }

    @Test
    public void nonExistingMetricsShouldBeIgnored() {
        String metricName = "some_non_existing_metric";
        MetricsFactory factory = new MetricsFactory(Arrays.asList(metricName));

        assertThat(factory.createMetrics()).hasSize(0);
    }

    @Test
    public void defaultConstructorShouldCreateAllMetrics() {
        String metricName = "some_non_existing_metric";
        MetricsFactory factory = new MetricsFactory();

        assertThat(factory.createMetrics()).hasSize(13);
    }

}