package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;


import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class CodeChurnTest {
    @Test
    public void should_have_initial_value_zero() {
        // when
        CodeChurn metric = new CodeChurn();

        // then
        assertThat(metric.value()).isEqualTo(0);
    }

    @Test
    public void should_increase_by_single_modification() {
        // given
        CodeChurn metric = new CodeChurn();

        // when
        metric.registerModification(new Modification("any", 7, 2));

        // then
        assertThat(metric.value()).isEqualTo(9);
    }


    @Test
    public void should_increase_by_multiple_modification() {
        // given
        CodeChurn metric = new CodeChurn();

        // when
        metric.registerModification(new Modification("any", 7, 2));
        metric.registerModification(new Modification("any", 7, 2));
        metric.registerModification(new Modification("any", 1, 1));

        // then
        assertThat(metric.value()).isEqualTo(20);
    }
}