package de.maibornwolff.codecharta.parser.svnlogparser.input.metrics

import de.maibornwolff.codecharta.parser.svnlogparser.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset

class SuccessiveWeeksWithCommitsTest {
    private val zoneOffset = ZoneOffset.UTC

    @Test
    fun `initial value zero`() {
// when
        val metric = SuccessiveWeeksWithCommits()

        // then
        assertThat(metric.value()).isEqualTo(0)
    }

    @Test
    fun `single modification`() { // given
        val metric = SuccessiveWeeksWithCommits()

        // when
        val date = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date))

        // then
        assertThat(metric.value()).isEqualTo(1)
    }

    @Test
    fun `additional modification in same calendar week`() { // given
        val metric = SuccessiveWeeksWithCommits()

        // when
        val date1 = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date1))
        val date2 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date2))

        // then
        assertThat(metric.value()).isEqualTo(1)
    }

    @Test
    fun `additional modification in successive calendar week`() { // given
        val metric = SuccessiveWeeksWithCommits()

        // when
        val date1 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date1))
        val date2 = OffsetDateTime.of(2016, 4, 4, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date2))

        // then
        assertThat(metric.value()).isEqualTo(2)
    }

    @Test
    fun additional_modification_in_non_successive_calendar_week() { // given
        val metric = SuccessiveWeeksWithCommits()

        // when
        val date1 = OffsetDateTime.of(2016, 4, 3, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date1))
        val date2 = OffsetDateTime.of(2016, 4, 11, 12, 0, 0, 0, zoneOffset)
        metric.registerCommit(Commit("author", emptyList(), date2))

        // then
        assertThat(metric.value()).isEqualTo(1)
    }
}
