package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

public class NumberOfWeeksWithCommitTest {
    @Test
    public void should_have_initial_value_zero() {
        // when
        NumberOfWeeksWithCommit metric = new NumberOfWeeksWithCommit();

        // then
        assertThat(metric.value()).isEqualTo(0);
    }

    @Test
    public void should_increase_by_single_modification() {
        // given
        NumberOfWeeksWithCommit metric = new NumberOfWeeksWithCommit();

        // when
        LocalDateTime date = LocalDateTime.of(2016, 4, 2, 12, 0);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date));

        // then
        assertThat(metric.value()).isEqualTo(1);
    }


    @Test
    public void should_not_increase_modification_if_modification_in_same_calendar_week() {
        // given
        NumberOfWeeksWithCommit metric = new NumberOfWeeksWithCommit();

        // when
        LocalDateTime date1 = LocalDateTime.of(2016, 4, 2, 12, 0);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date1));
        LocalDateTime date2 = LocalDateTime.of(2016, 4, 3, 12, 0);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date2));

        // then
        assertThat(metric.value()).isEqualTo(1);
    }

    @Test
    public void should_increase_modification_if_modification_in_different_calendar_week() {
        // given
        NumberOfWeeksWithCommit metric = new NumberOfWeeksWithCommit();

        // when
        LocalDateTime date1 = LocalDateTime.of(2016, 4, 3, 12, 0);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date1));
        LocalDateTime date2 = LocalDateTime.of(2016, 4, 4, 12, 0);
        metric.registerCommit(new Commit("author", Collections.emptyList(), date2));

        // then
        assertThat(metric.value()).isEqualTo(2);
    }
}