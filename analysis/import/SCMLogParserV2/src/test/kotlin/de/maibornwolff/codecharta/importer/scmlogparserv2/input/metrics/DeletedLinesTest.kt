package de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class DeletedLinesTest {

    private val FILENAME = "filename"

    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = AddedLines()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_not_increase_by_single_modification_if_more_additions() {
        // given
        val metric = DeletedLines()

        // when
        metric.registerModification(Modification(FILENAME, 7, 2))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_ncrease_by_single_modification_if_more_deletes() {
        // given
        val metric = DeletedLines()

        // when
        metric.registerModification(Modification(FILENAME, 2, 7))

        // then
        assertThat(metric.value()).isEqualTo(5L)
    }

    @Test
    fun should_not_increase_by_multiple_modification_if_more_additions() {
        // given
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
    fun should_increase_by_multiple_modification_if_more_deletes() {
        // given
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
