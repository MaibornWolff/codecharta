package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import org.assertj.core.api.Assertions
import org.junit.Test
import java.time.OffsetDateTime

class AgeInWeeksTest {
    @Test
    fun `initial value is zero`() {
        val metric = AgeInWeeks()

        Assertions.assertThat(metric.value()).isEqualTo(0)
    }

    @Test
    fun `value should be zero if created this week`() {
        val date = OffsetDateTime.now()
        val metric = AgeInWeeks()
        metric.registerCommit(Commit("foo", emptyList(), date))

        Assertions.assertThat(metric.value()).isEqualTo(0)
    }

    @Test
    fun `should have the correct age if one commit`() {
        val date = OffsetDateTime.now().minusDays(14)
        val metric = AgeInWeeks()
        metric.registerCommit(Commit("foo", emptyList(), date))

        Assertions.assertThat(metric.value()).isEqualTo(2)
    }

    @Test
    fun `should have the correct age if multiple commits`() {
        val dateRecent = OffsetDateTime.now().minusDays(14)
        val dateOlder = OffsetDateTime.now().minusDays(21)
        val metric = AgeInWeeks()
        metric.registerCommit(Commit("foo", emptyList(), dateRecent))
        metric.registerCommit(Commit("foo", emptyList(), dateOlder))

        Assertions.assertThat(metric.value()).isEqualTo(3)
    }
}