package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;


import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class LinesOfCodeTest {
    public static final String FILENAME = "file";

    @Test
    public void should_have_initial_value_zero() {
        // when
        LinesOfCode metric = new LinesOfCode();

        // then
        assertThat(metric.value()).isEqualTo(0);
    }

    @Test
    public void should_compute_single_modification() {
        // given
        LinesOfCode metric = new LinesOfCode();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));

        // then
        assertThat(metric.value()).isEqualTo(5);
    }


    @Test
    public void should_compute_multiple_modification() {
        // given
        LinesOfCode metric = new LinesOfCode();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));
        metric.registerModification(new Modification(FILENAME, 0, 2));
        metric.registerModification(new Modification(FILENAME, 1, 1));
        metric.registerModification(new Modification(FILENAME, 6, 2));
        metric.registerModification(new Modification(FILENAME, 1, 0));

        // then
        assertThat(metric.value()).isEqualTo(8);
    }
}