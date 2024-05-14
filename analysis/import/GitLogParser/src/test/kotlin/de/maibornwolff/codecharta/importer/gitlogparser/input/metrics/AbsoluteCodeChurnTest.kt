package de.maibornwolff.codecharta.importer.gitlogparser.input.metrics

import de.maibornwolff.codecharta.importer.gitlogparser.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AbsoluteCodeChurnTest {
    companion object {
    private const val FILENAME = "filename"
    }

    @Test
    fun should_have_initial_value_zero() {
// when
        val metric = AbsoluteCodeChurn()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_by_single_modification() { // given
        val metric = AbsoluteCodeChurn()

        // when
        metric.registerModification(Modification(Companion.FILENAME, 7, 2))

        // then
        assertThat(metric.value()).isEqualTo(9L)
    }

    @Test
    fun should_increase_by_multiple_modification() { // given
        val metric = AbsoluteCodeChurn()

        // when
        metric.registerModification(Modification(Companion.FILENAME, 7, 2))
        metric.registerModification(Modification(Companion.FILENAME, 0, 2))
        metric.registerModification(Modification(Companion.FILENAME, 1, 1))
        metric.registerModification(Modification(Companion.FILENAME, 6, 2))

        // then
        assertThat(metric.value()).isEqualTo(21L)
    }
}
