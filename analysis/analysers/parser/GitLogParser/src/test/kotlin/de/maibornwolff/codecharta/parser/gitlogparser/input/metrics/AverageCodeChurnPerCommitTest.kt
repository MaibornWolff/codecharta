package de.maibornwolff.codecharta.parser.gitlogparser.input.metrics

import de.maibornwolff.codecharta.parser.gitlogparser.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AverageCodeChurnPerCommitTest {
    companion object {
        private const val FILENAME = "filename"
    }

    @Test
    fun should_have_initial_value_zero() {
// when
        val metric = AverageCodeChurnPerCommit()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_by_single_modification() { // given
        val metric = AverageCodeChurnPerCommit()

        // when
        metric.registerModification(Modification(FILENAME, 7, 2))

        // then
        assertThat(metric.value()).isEqualTo(9L)
    }

    @Test
    fun should_increase_by_multiple_modification() { // given
        val metric = AverageCodeChurnPerCommit()

        // when
        metric.registerModification(Modification(FILENAME, 7, 2))
        metric.registerModification(Modification(FILENAME, 0, 2))
        metric.registerModification(Modification(FILENAME, 1, 1))
        metric.registerModification(Modification(FILENAME, 6, 2))

        // then
        assertThat(metric.value()).isEqualTo(5L)
    }
}
