package de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset

class RangeOfWeeksWithCommitsTest {
    private val zoneOffset = ZoneOffset.UTC

    @Test
    fun initial_value_zero() {
        // when
        val metric = RangeOfWeeksWithCommits()

        // then
        assertThat(metric.value()).isEqualTo(0)
    }

    @Test
    fun single_modification() {
        // given
        val metric = RangeOfWeeksWithCommits()

        // when
        val date = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date))

        // then
        assertThat(metric.value()).isEqualTo(1)
    }

    @Test
    fun additional_modification_in_same_calendar_week() {
        // given
        val metric = RangeOfWeeksWithCommits()

        // when
        val date1 = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date1))
        val date2 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date2))

        // then
        assertThat(metric.value()).isEqualTo(1)
    }

    @Test
    fun additional_modification_in_successive_calendar_week() {
        // given
        val metric = RangeOfWeeksWithCommits()

        // when
        val date1 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date1))
        val date2 = OffsetDateTime.of(2016, 4, 4, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date2))

        // then
        assertThat(metric.value()).isEqualTo(2)
    }

    @Test
    fun additional_modification_in_non_successive_calendar_week() {
        // given
        val metric = RangeOfWeeksWithCommits()

        // when
        val date1 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date1))
        val date2 = OffsetDateTime.of(2016, 4, 11, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date2))

        // then
        assertThat(metric.value()).isEqualTo(3)
    }
}
