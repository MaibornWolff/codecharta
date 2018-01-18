package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;


import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class CodeChurnTest {
    private static final String FILENAME = "filename";

    @Test
    public void should_have_initial_value_zero() {
        // when
        CodeChurn metric = new CodeChurn();

        // then
        assertThat(metric.absoluteCodeChurn()).isEqualTo(0L);
        assertThat(metric.loc()).isEqualTo(0L);
        assertThat(metric.relativeCodeChurn()).isEqualTo(0L);
    }

    @Test
    public void should_increase_by_single_modification() {
        // given
        CodeChurn metric = new CodeChurn();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));

        // then
        assertThat(metric.absoluteCodeChurn()).isEqualTo(9L);
        assertThat(metric.loc()).isEqualTo(5L);
        assertThat(metric.relativeCodeChurn()).isEqualTo(180);
    }


    @Test
    public void should_increase_by_multiple_modification() {
        // given
        CodeChurn metric = new CodeChurn();

        // when
        metric.registerModification(new Modification(FILENAME, 7, 2));
        metric.registerModification(new Modification(FILENAME, 0, 2));
        metric.registerModification(new Modification(FILENAME, 1, 1));
        metric.registerModification(new Modification(FILENAME, 6, 2));

        // then
        assertThat(metric.absoluteCodeChurn()).isEqualTo(21L);
        assertThat(metric.loc()).isEqualTo(7L);
        assertThat(metric.relativeCodeChurn()).isEqualTo(300);
    }
}