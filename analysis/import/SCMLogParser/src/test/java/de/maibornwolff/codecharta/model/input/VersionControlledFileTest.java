package de.maibornwolff.codecharta.model.input;

import org.junit.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static de.maibornwolff.codecharta.model.input.metrics.NumberOfAuthors.NUMBER_OF_AUTHORS;
import static de.maibornwolff.codecharta.model.input.metrics.NumberOfOccurencesInCommits.NUMBER_OF_COMMITS;
import static de.maibornwolff.codecharta.model.input.metrics.WeeksWithCommit.WEEKS_WITH_COMMITS;
import static org.assertj.core.api.Assertions.assertThat;

public class VersionControlledFileTest {

    private static List<Modification> modificationsByFilename(String... filenames) {
        return Stream.of(filenames).map(Modification::new).collect(Collectors.toList());
    }

    @Test
    public void versionControlledFileHoldsInitallyOnlyTheFilename() throws Exception {
        // given
        String filename = "filename";

        // when
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename);

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).isEmpty();
        assertThat(versionControlledFile.getMetricValue(NUMBER_OF_AUTHORS)).isEqualTo(0);
        assertThat(versionControlledFile.getMetricValue(NUMBER_OF_COMMITS)).isEqualTo(0);
    }


    @Test
    public void canRegisterACommit() throws Exception {
        // given
        String filename = "filename";
        String author = "An Author";
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename);

        // when
        versionControlledFile.registerCommit(new Commit(author, modificationsByFilename(filename), LocalDateTime.now()));

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactly(author);
        assertThat(versionControlledFile.getMetricValue(NUMBER_OF_AUTHORS)).isEqualTo(1);
        assertThat(versionControlledFile.getMetricValue(NUMBER_OF_COMMITS)).isEqualTo(1);
    }

    @Test
    public void canRegisterMultipleCommitsWithSimpleStatistics() throws Exception {
        // given
        String filename = "filename";
        String author1 = "An Author";
        String author2 = "2nd Author";
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename);

        // when
        versionControlledFile.registerCommit(new Commit(author1, modificationsByFilename(filename), LocalDateTime.now()));
        versionControlledFile.registerCommit(new Commit(author2, modificationsByFilename(filename), LocalDateTime.now()));
        versionControlledFile.registerCommit(new Commit(author1, modificationsByFilename(filename), LocalDateTime.now()));

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactlyInAnyOrder(author1, author2);
        assertThat(versionControlledFile.getMetricValue(NUMBER_OF_AUTHORS)).isEqualTo(2);
        assertThat(versionControlledFile.getMetricValue(NUMBER_OF_COMMITS)).isEqualTo(3);
    }


    @Test
    public void canRegisterMultipleCommitsAndReturnsCommitWeeks() throws Exception {
        // given
        String filename = "filename";
        String author1 = "An Author";
        String author2 = "A 2nd Author";
        LocalDateTime commitDate1 = LocalDateTime.now();
        LocalDateTime commitDate2 = LocalDateTime.now();
        LocalDateTime commitDate3 = commitDate1.minusDays(7);
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename);

        // when
        versionControlledFile.registerCommit(new Commit(author1, modificationsByFilename(filename), commitDate1));
        versionControlledFile.registerCommit(new Commit(author2, modificationsByFilename(filename), commitDate2));
        versionControlledFile.registerCommit(new Commit(author1, modificationsByFilename(filename), commitDate3));

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactlyInAnyOrder(author1, author2);
        assertThat(versionControlledFile.getMetricValue(NUMBER_OF_AUTHORS)).isEqualTo(2);
        assertThat(versionControlledFile.getMetricValue(NUMBER_OF_COMMITS)).isEqualTo(3);
        assertThat(versionControlledFile.getMetricValue(WEEKS_WITH_COMMITS)).isEqualTo(2);
    }

}