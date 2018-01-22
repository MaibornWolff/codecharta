package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import org.junit.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

public class WeeksWithCommitsTest {
    private final ZoneOffset zoneOffset = ZoneOffset.UTC;

    @Test
    public void initial_value_zero() {
        // when
        WeeksWithCommits metric = new WeeksWithCommits();

        // then
        assertThat(metric.numberOfWeeksWithCommit()).isEqualTo(0);
        assertThat(metric.commitDateSpan()).isEqualTo(0);
        assertThat(metric.numberOfSuccessiveWeeksWithCommit()).isEqualTo(0);

        assertThat(metric.value().values()).hasSize(3);
        assertThat(metric.value().values()).containsOnly(0, 0L);
    }

    @Test
    public void single_modification() {
        // given
        WeeksWithCommits metric = new WeeksWithCommits();

        // when
        OffsetDateTime date = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date));

        // then
        assertThat(metric.numberOfWeeksWithCommit()).isEqualTo(1);
        assertThat(metric.commitDateSpan()).isEqualTo(1);
        assertThat(metric.numberOfSuccessiveWeeksWithCommit()).isEqualTo(1);
    }


    @Test
    public void additional_modification_in_same_calendar_week() {
        // given
        WeeksWithCommits metric = new WeeksWithCommits();

        // when
        OffsetDateTime date1 = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date1));
        OffsetDateTime date2 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date2));

        // then
        assertThat(metric.numberOfWeeksWithCommit()).isEqualTo(1);
        assertThat(metric.commitDateSpan()).isEqualTo(1);
        assertThat(metric.numberOfSuccessiveWeeksWithCommit()).isEqualTo(1);
    }

    @Test
    public void additional_modification_in_successive_calendar_week() {
        // given
        WeeksWithCommits metric = new WeeksWithCommits();

        // when
        OffsetDateTime date1 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date1));
        OffsetDateTime date2 = OffsetDateTime.of(2016, 4, 4, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date2));

        // then
        assertThat(metric.numberOfWeeksWithCommit()).isEqualTo(2);
        assertThat(metric.commitDateSpan()).isEqualTo(2);
        assertThat(metric.numberOfSuccessiveWeeksWithCommit()).isEqualTo(2);
    }

    @Test
    public void additional_modification_in_non_successive_calendar_week() {
        // given
        WeeksWithCommits metric = new WeeksWithCommits();

        // when
        OffsetDateTime date1 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date1));
        OffsetDateTime date2 = OffsetDateTime.of(2016, 4, 11, 12, 0, 0, 0, zoneOffset);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date2));

        // then
        assertThat(metric.numberOfWeeksWithCommit()).isEqualTo(2);
        assertThat(metric.commitDateSpan()).isEqualTo(3);
        assertThat(metric.numberOfSuccessiveWeeksWithCommit()).isEqualTo(1);
    }
}