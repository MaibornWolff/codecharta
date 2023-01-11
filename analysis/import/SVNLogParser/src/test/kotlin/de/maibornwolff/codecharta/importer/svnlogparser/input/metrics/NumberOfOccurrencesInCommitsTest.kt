package de.maibornwolff.codecharta.importer.svnlogparser.input.metrics

import de.maibornwolff.codecharta.importer.svnlogparser.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class NumberOfOccurrencesInCommitsTest {
    @Test
    fun `number of occurrences in commits test`() {
        // when
        val metric = NumberOfOccurencesInCommits()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun `should increase by modification`() {
        // given
        val metric = NumberOfOccurencesInCommits()

        // when
        metric.registerModification(Modification("any"))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }
}
