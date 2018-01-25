package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;


import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class AbsoluteCodeChurnTest {
    private static final String FILENAME = "filename";

    @Test
    public void should_have_initial_value_zero() {
        // when
        AbsoluteCodeChurn metric = new AbsoluteCodeChurn();

        // then
        assertThat(metric.value()).isEqualTo(0L);
    }

    @Test
    public void should_increase_by_single_modification() {
        // given
        AbsoluteCodeChurn metric = new AbsoluteCodeChurn();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));

        // then
        assertThat(metric.value()).isEqualTo(9L);
    }


    @Test
    public void should_increase_by_multiple_modification() {
        // given
        AbsoluteCodeChurn metric = new AbsoluteCodeChurn();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));
        metric.registerModification(new Modification(FILENAME, 0, 2));
        metric.registerModification(new Modification(FILENAME, 1, 1));
        metric.registerModification(new Modification(FILENAME, 6, 2));

        // then
        assertThat(metric.value()).isEqualTo(21L);
    }
}