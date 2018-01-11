package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class MetricsFactoryTest {
    @Test
    public void createModificationMetricsShouldReturnCorrectMetric() {
        String metricName = "code_churn";
        MetricsFactory factory = new MetricsFactory(Arrays.asList(metricName));

        List<ModificationMetric> modificationMetrics = factory.createModificationMetrics();

        assertThat(modificationMetrics).hasSize(1);
        assertThat(modificationMetrics.get(0).metricName()).isSameAs(metricName);
    }

    @Test
    public void createCommitMetricsShouldReturnCorrectMetric() {
        String metricName = "number_of_authors";
        MetricsFactory factory = new MetricsFactory(Arrays.asList(metricName));

        List<CommitMetric> commitMetrics = factory.createCommitMetrics();

        assertThat(commitMetrics).hasSize(1);
        assertThat(commitMetrics.get(0).metricName()).isSameAs(metricName);
    }

    @Test
    public void nonExistingMetricsShouldBeIgnored() {
        String metricName = "some_non_existing_metric";
        MetricsFactory factory = new MetricsFactory(Arrays.asList(metricName));

        assertThat(factory.createModificationMetrics()).hasSize(0);
        assertThat(factory.createCommitMetrics()).hasSize(0);
    }

}