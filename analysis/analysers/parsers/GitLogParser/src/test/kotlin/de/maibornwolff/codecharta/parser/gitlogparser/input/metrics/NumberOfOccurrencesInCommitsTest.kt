package de.maibornwolff.codecharta.parser.gitlogparser.input.metrics

import de.maibornwolff.codecharta.parser.gitlogparser.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class NumberOfOccurrencesInCommitsTest {
    @Test
    fun should_have_initial_value_zero() {
// when
        val metric = NumberOfOccurencesInCommits()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_by_modification() { // given
        val metric = NumberOfOccurencesInCommits()

        // when
        metric.registerModification(Modification("any"))

        // then
        assertThat(metric.value()).isEqualTo(1L)
    }
}
