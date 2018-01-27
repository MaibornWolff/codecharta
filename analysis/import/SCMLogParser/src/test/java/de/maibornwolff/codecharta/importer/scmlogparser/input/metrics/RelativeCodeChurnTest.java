package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;


import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class RelativeCodeChurnTest {
    private static final String FILENAME = "filename";

    @Test
    public void should_have_initial_value_zero() {
        // when
        RelativeCodeChurn metric = new RelativeCodeChurn();

        // then
        assertThat(metric.value()).isEqualTo(0L);
    }

    @Test
    public void should_increase_by_single_modification() {
        // given
        RelativeCodeChurn metric = new RelativeCodeChurn();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));

        // then
//        assertThat(metric.value()).isEqualTo(180L);
    }


    @Test
    public void should_increase_by_multiple_modification() {
        // given
        RelativeCodeChurn metric = new RelativeCodeChurn();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));
        metric.registerModification(new Modification(FILENAME, 0, 2));
        metric.registerModification(new Modification(FILENAME, 1, 1));
        metric.registerModification(new Modification(FILENAME, 6, 2));

        // then
        // assertThat(metric.value()).isEqualTo(300L);
    }
}