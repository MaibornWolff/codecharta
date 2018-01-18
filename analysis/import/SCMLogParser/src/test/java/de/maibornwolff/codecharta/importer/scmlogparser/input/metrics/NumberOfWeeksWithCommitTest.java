package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import org.junit.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

public class NumberOfWeeksWithCommitTest {
    private final ZoneOffset zoneOffset = ZoneOffset.UTC;

    @Test
    public void should_have_initial_value_zero() {
        // when
        NumberOfWeeksWithCommit metric = new NumberOfWeeksWithCommit();

        // then
        assertThat(metric.value(metric.metricName())).isEqualTo(0);
    }

    @Test
    public void should_increase_by_single_modification() {
        // given
        NumberOfWeeksWithCommit metric = new NumberOfWeeksWithCommit();

        // when
        OffsetDateTime date = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date));

        // then
        assertThat(metric.value(metric.metricName())).isEqualTo(1);
    }


    @Test
    public void should_not_increase_modification_if_modification_in_same_calendar_week() {
        // given
        NumberOfWeeksWithCommit metric = new NumberOfWeeksWithCommit();

        // when
        OffsetDateTime date1 = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date1));
        OffsetDateTime date2 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date2));

        // then
        assertThat(metric.value(metric.metricName())).isEqualTo(1);
    }

    @Test
    public void should_increase_modification_if_modification_in_different_calendar_week() {
        // given
        NumberOfWeeksWithCommit metric = new NumberOfWeeksWithCommit();

        // when
        OffsetDateTime date1 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date1));
        OffsetDateTime date2 = OffsetDateTime.of(2016, 4, 4, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date2));

        // then
        assertThat(metric.value(metric.metricName())).isEqualTo(2);
    }
}