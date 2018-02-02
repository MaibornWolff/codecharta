package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import org.junit.Test;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

public class MedianCoupledFilesTest {
    private static final String FILENAME = "filename";
    private static final String COUPLED_FILE1 = "coupledfilename1";
    private static final String COUPLED_FILE2 = "coupledfilename2";

    @Test
    public void should_have_initial_value_zero() {
        // when
        MedianCoupledFiles metric = new MedianCoupledFiles();

        // then
        assertThat(metric.value()).isEqualTo(0d);
    }

    @Test
    public void should_not_increase_on_commits_of_same_file() {
        // given
        MedianCoupledFiles metric = new MedianCoupledFiles();

        // when
        registerModifications(metric, FILENAME);

        // then
        assertThat(metric.value()).isEqualTo(0d);
    }

    @Test
    public void should_increase_on_commit_of_several_files() {
        // given
        MedianCoupledFiles metric = new MedianCoupledFiles();

        // when
        registerModifications(metric, FILENAME, COUPLED_FILE1);

        // then
        assertThat(metric.value()).isEqualTo(1d);
    }


    @Test
    public void should_increase_by_two_modification() {
        // given
        MedianCoupledFiles metric = new MedianCoupledFiles();

        // when
        registerModifications(metric, FILENAME, COUPLED_FILE1);
        registerModifications(metric, FILENAME);

        // then
        assertThat(metric.value()).isEqualTo(0.5);
    }

    @Test
    public void should_increase_by_three_modification() {
        // given
        MedianCoupledFiles metric = new MedianCoupledFiles();

        // when
        registerModifications(metric, FILENAME, COUPLED_FILE1);
        registerModifications(metric, FILENAME, COUPLED_FILE2);
        registerModifications(metric, FILENAME);

        // then
        assertThat(metric.value()).isEqualTo(1d);
    }

    private void registerModifications(Metric metric, String... filenames) {
        List<Modification> modificationList = Arrays.stream(filenames)
                .map(Modification::new)
                .collect(Collectors.toList());

        Commit commit = new Commit("author", modificationList, OffsetDateTime.now());
        metric.registerCommit(commit);

        modificationList.stream()
                .filter(mod -> FILENAME.equals(mod.getFilename()))
                .findFirst()
                .ifPresent(metric::registerModification);
    }
}