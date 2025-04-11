package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AbsoluteCodeChurnTest {
    companion object {
        private const val FILENAME = "filename"
    }

    @Test
    fun `should have initial value zero`() {
// when
        val metric = AbsoluteCodeChurn()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun `should increase by single modification`() { // given
        val metric = AbsoluteCodeChurn()

        // when
        metric.registerModification(Modification(FILENAME, 7, 2))

        // then
        assertThat(metric.value()).isEqualTo(9L)
    }

    @Test
    fun should_increase_by_multiple_modification() { // given
        val metric = AbsoluteCodeChurn()

        // when
        metric.registerModification(Modification(FILENAME, 7, 2))
        metric.registerModification(Modification(FILENAME, 0, 2))
        metric.registerModification(Modification(FILENAME, 1, 1))
        metric.registerModification(Modification(FILENAME, 6, 2))

        // then
        assertThat(metric.value()).isEqualTo(21L)
    }
}
