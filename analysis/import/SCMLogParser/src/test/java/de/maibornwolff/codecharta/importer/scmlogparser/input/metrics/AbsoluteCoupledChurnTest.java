package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Test;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class AbsoluteCoupledChurnTest {
    private static final String FILENAME = "filename";
    private static final String COUPLED_FILE1 = "coupledfilename1";
    private static final String COUPLED_FILE2 = "coupledfilename2";

    @Test
    public void should_have_initial_value_zero() {
        // when
        AbsoluteCoupledChurn metric = new AbsoluteCoupledChurn();

        // then
        assertThat(metric.value()).isEqualTo(0L);
    }

    @Test
    public void should_not_increase_on_commits_of_same_file() {
        // given
        AbsoluteCoupledChurn metric = new AbsoluteCoupledChurn();

        // when
        registerModifications(metric, new Modification(FILENAME, 7, 2));

        // then
        assertThat(metric.value()).isEqualTo(0L);
    }

    @Test
    public void should_increase_on_commit_of_several_files() {
        // given
        AbsoluteCoupledChurn metric = new AbsoluteCoupledChurn();

        // when
        Modification modification = new Modification(FILENAME, 7, 2);
        Modification modificationOfSecondFile = new Modification(COUPLED_FILE1, 3, 1);
        registerModifications(metric, modification, modificationOfSecondFile);

        // then
        assertThat(metric.value()).isEqualTo(4L);
    }


    @Test
    public void should_increase_by_multiple_modification() {
        // given
        AbsoluteCoupledChurn metric = new AbsoluteCoupledChurn();

        // when
        Modification modification1 = new Modification(FILENAME, 7, 2);
        Modification modificationOfSecondFile1 = new Modification(COUPLED_FILE1, 3, 1);
        registerModifications(metric, modification1, modificationOfSecondFile1);

        Modification modification2 = new Modification(FILENAME, 0, 2);
        Modification modificationOfThirdFile2 = new Modification(COUPLED_FILE2, 1, 4);
        registerModifications(metric, modification2, modificationOfThirdFile2);

        Modification modification3 = new Modification(FILENAME, 1, 1);
        registerModifications(metric, modification3);

        // then
        assertThat(metric.value()).isEqualTo(9L);
    }


    private void registerModifications(Metric metric, Modification modification, Modification... otherModifications) {
        List<Modification> modificationList = new ArrayList(Arrays.asList(otherModifications));
        modificationList.add(modification);

        Commit commit = new Commit("author", modificationList, OffsetDateTime.now());
        metric.registerCommit(commit);
        metric.registerModification(modification);
    }
}