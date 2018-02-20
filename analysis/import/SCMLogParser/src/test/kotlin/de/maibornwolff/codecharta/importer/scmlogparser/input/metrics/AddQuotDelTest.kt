package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class AddQuotDelTest {

    private val FILENAME = "filename"

    @Test
    fun should_have_initial_value_zero() {
        // when
        val metric = AddQuotDel()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_work_if_add_and_del_in_one_commit() {
        // given
        val metric = AddQuotDel()

        // when
        metric.registerModification(Modification(FILENAME, 7, 2))

        // then
        assertThat(metric.value()).isEqualTo(350L)
    }

    @Test
    fun should_have_add_value_if_no_del_in_one_commit() {
        // given
        val metric = AddQuotDel()

        // when
        metric.registerModification(Modification(FILENAME, 7, 0))

        // then
        assertThat(metric.value()).isEqualTo(700L)
    }

    @Test
    fun should_be_zero_if_no_add_in_one_commit() {
        // given
        val metric = AddQuotDel()

        // when
        metric.registerModification(Modification(FILENAME, 0, 2))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_be_zero_if_no_add_and_no_del_in_one_commit() {
        // given
        val metric = AddQuotDel()

        // when
        metric.registerModification(Modification(FILENAME, 0, 0))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun should_calculate_for_multiple_modification() {
        // given
        val metric = AddQuotDel()

        // when
        metric.registerModification(Modification(FILENAME, 7, 2))
        metric.registerModification(Modification(FILENAME, 0, 2))
        metric.registerModification(Modification(FILENAME, 1, 1))
        metric.registerModification(Modification(FILENAME, 6, 2))

        // then
        assertThat(metric.value()).isEqualTo(200L)
    }
}