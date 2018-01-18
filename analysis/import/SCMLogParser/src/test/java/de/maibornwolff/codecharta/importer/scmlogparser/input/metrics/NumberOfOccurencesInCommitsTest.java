package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class NumberOfOccurencesInCommitsTest {
    @Test
    public void should_have_initial_value_zero() {
        // when
        NumberOfOccurencesInCommits metric = new NumberOfOccurencesInCommits();

        // then
        assertThat(metric.value(metric.metricName())).isEqualTo(0L);
    }

    @Test
    public void should_increase_by_modification() {
        // given
        NumberOfOccurencesInCommits metric = new NumberOfOccurencesInCommits();

        // when
        metric.registerModification(new Modification("any"));

        // then
        assertThat(metric.value(metric.metricName())).isEqualTo(1L);
    }
}