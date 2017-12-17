package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.model.input.Commit;
import de.maibornwolff.codecharta.model.input.Modification;
import de.maibornwolff.codecharta.model.input.VersionControlledFile;
import de.maibornwolff.codecharta.model.input.metrics.MetricsFactory;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static de.maibornwolff.codecharta.model.input.metrics.NumberOfOccurencesInCommits.NUMBER_OF_COMMITS;
import static java.util.Arrays.asList;
import static java.util.Collections.singleton;
import static org.assertj.core.api.Assertions.*;

public class CommitCollectorTest {

    private static List<Modification> modificationsByFilename(String... filenames) {
        return Stream.of(filenames).map(Modification::new).collect(Collectors.toList());
    }

    private final MetricsFactory metricsFactory = new MetricsFactory();

    @Test
    public void collectsCommits() {
        LocalDateTime commitDate = LocalDateTime.now();
        Commit firstCommit = new Commit("TheAuthor", modificationsByFilename("src/Main.java", "src/Util.java"), commitDate);
        Commit secondCommit = new Commit("AnotherAuthor", modificationsByFilename("src/Util.java"), commitDate);
        List<VersionControlledFile> commits = Stream.of(firstCommit, secondCommit).collect(CommitCollector.create(metricsFactory));
        assertThat(commits)
                .extracting(VersionControlledFile::getFilename, f -> f.getMetricValue(NUMBER_OF_COMMITS), VersionControlledFile::getAuthors)
                .containsExactly(
                        tuple("src/Main.java", 1, singleton("TheAuthor")),
                        tuple("src/Util.java", 2, new HashSet<>(asList("TheAuthor", "AnotherAuthor"))));
    }

    @Test
    public void doesNotCollectEmptyFilenames() {
        Commit commit = new Commit("TheAuthor", modificationsByFilename(""), LocalDateTime.now());
        List<VersionControlledFile> commits = Stream.of(commit).collect(CommitCollector.create(metricsFactory));
        assertThat(commits).isEmpty();
    }

    @Test
    public void collectsHalfEmptyFilelists() {
        Commit commit = new Commit("TheAuthor", modificationsByFilename("", "src/Main.java"), LocalDateTime.now());
        List<VersionControlledFile> commits = Stream.of(commit).collect(CommitCollector.create(metricsFactory));
        assertThat(commits)
                .extracting(VersionControlledFile::getFilename)
                .containsExactly("src/Main.java");
    }

    @Test
    public void doesNotSupportParallelStreams() {
        Commit commit = new Commit("TheAuthor", modificationsByFilename("src/Main.java", "src/Util.java"), LocalDateTime.now());
        Stream<Commit> parallelCommitStream = Stream.of(commit, commit).parallel();
        assertThatThrownBy(() -> parallelCommitStream.collect(CommitCollector.create(metricsFactory))).isInstanceOf(UnsupportedOperationException.class);
    }

}
