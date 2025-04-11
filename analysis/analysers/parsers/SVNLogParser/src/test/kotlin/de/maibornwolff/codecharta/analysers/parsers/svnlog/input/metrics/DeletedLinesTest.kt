package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DeletedLinesTest {
    companion object {
        private const val FILENAME = "filename"
    }

    @Test
    fun `should have initial value zero`() {
// when
        val metric = AddedLines()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun `should not increase by single modification if more additions`() { // given
        val metric = DeletedLines()

        // when
        metric.registerModification(Modification(FILENAME, 7, 2))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun `should increase by single modification if more deletes`() { // given
        val metric = DeletedLines()

        // when
        metric.registerModification(Modification(FILENAME, 2, 7))

        // then
        assertThat(metric.value()).isEqualTo(5L)
    }

    @Test
    fun `should not increase by multiple modification if more additions`() { // given
        val metric = DeletedLines()

        // when
        metric.registerModification(Modification(FILENAME, 7, 2))
        metric.registerModification(Modification(FILENAME, 0, 2))
        metric.registerModification(Modification(FILENAME, 1, 1))
        metric.registerModification(Modification(FILENAME, 6, 2))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_increase_by_multiple_modification_if_more_deletes() { // given
        val metric = DeletedLines()

        // when
        metric.registerModification(Modification(FILENAME, 2, 7))
        metric.registerModification(Modification(FILENAME, 2, 0))
        metric.registerModification(Modification(FILENAME, 1, 1))
        metric.registerModification(Modification(FILENAME, 2, 6))

        // then
        assertThat(metric.value()).isEqualTo(7L)
    }
}
