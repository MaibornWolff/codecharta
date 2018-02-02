package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class AddQuotDelTest {
    private static final String FILENAME = "filename";

    @Test
    public void should_have_initial_value_zero() {
        // when
        AddQuotDel metric = new AddQuotDel();

        // then
        assertThat(metric.value()).isEqualTo(0L);
    }

    @Test
    public void should_work_if_add_and_del_in_one_commit() {
        // given
        AddQuotDel metric = new AddQuotDel();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));

        // then
        assertThat(metric.value()).isEqualTo(350L);
    }

    @Test
    public void should_have_add_value_if_no_del_in_one_commit() {
        // given
        AddQuotDel metric = new AddQuotDel();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 0));

        // then
        assertThat(metric.value()).isEqualTo(700L);
    }

    @Test
    public void should_be_zero_if_no_add_in_one_commit() {
        // given
        AddQuotDel metric = new AddQuotDel();

        // when
        metric.registerModification(new Modification(FILENAME, 0, 2));

        // then
        assertThat(metric.value()).isEqualTo(0L);
    }

    @Test
    public void should_be_zero_if_no_add_and_no_del_in_one_commit() {
        // given
        AddQuotDel metric = new AddQuotDel();

        // when
        metric.registerModification(new Modification(FILENAME, 0, 0));

        // then
        assertThat(metric.value()).isEqualTo(0L);
    }

    @Test
    public void should_calculate_for_multiple_modification() {
        // given
        AddQuotDel metric = new AddQuotDel();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));
        metric.registerModification(new Modification(FILENAME, 0, 2));
        metric.registerModification(new Modification(FILENAME, 1, 1));
        metric.registerModification(new Modification(FILENAME, 6, 2));

        // then
        assertThat(metric.value()).isEqualTo(200L);
    }
}