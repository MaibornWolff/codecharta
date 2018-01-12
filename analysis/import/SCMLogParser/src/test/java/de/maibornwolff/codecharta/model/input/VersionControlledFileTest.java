package de.maibornwolff.codecharta.model.input;

import de.maibornwolff.codecharta.model.input.metrics.CommitMetric;
import de.maibornwolff.codecharta.model.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.model.input.metrics.ModificationMetric;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

public class VersionControlledFileTest {

    private final MetricsFactory metricsFactory = mock(MetricsFactory.class);

    @Test
    public void versionControlledFileHoldsInitallyOnlyTheFilename() {
        // given
        String filename = "filename";

        // when
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename, metricsFactory);

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).isEmpty();
    }


    @Test
    public void ignoresCommitsForDifferentFiles() {
        // given
        ModificationMetric modificationMetric = mock(ModificationMetric.class);
        CommitMetric commitMetric = mock(CommitMetric.class);

        VersionControlledFile versionControlledFile = new VersionControlledFile(
                "filename",
                Arrays.asList(modificationMetric),
                Arrays.asList(commitMetric)
        );

        // when
        Modification modification = new Modification("anotherFilename");
        Commit commit = createCommit("An Author", modification);
        versionControlledFile.registerCommit(commit);

        // then
        assertThat(versionControlledFile.getAuthors()).isEmpty();

        verify(modificationMetric, times(0)).registerModification(any());

        verify(commitMetric, times(0)).registerCommit(any());
    }

    @Test
    public void canRegisterACommit() {
        // given
        ModificationMetric modificationMetric = mock(ModificationMetric.class);
        CommitMetric commitMetric = mock(CommitMetric.class);

        String filename = "filename";
        String author = "An Author";
        VersionControlledFile versionControlledFile = new VersionControlledFile(
                filename,
                Arrays.asList(modificationMetric),
                Arrays.asList(commitMetric)
        );

        // when
        Modification modification = new Modification(filename);
        Commit commit = createCommit(author, modification);
        versionControlledFile.registerCommit(commit);

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactly(author);

        verify(modificationMetric, times(1)).registerModification(any());
        verify(modificationMetric, times(1)).registerModification(eq(modification));

        verify(commitMetric, times(1)).registerCommit(any());
        verify(commitMetric, times(1)).registerCommit(eq(commit));
    }

    @Test
    public void canRegisterMultipleCommitsWithSimpleStatistics() {
        // given
        ModificationMetric modificationMetric = mock(ModificationMetric.class);
        CommitMetric commitMetric = mock(CommitMetric.class);

        String filename = "filename";
        String author1 = "An Author";
        String author2 = "2nd Author";
        VersionControlledFile versionControlledFile = new VersionControlledFile(
                filename,
                Arrays.asList(modificationMetric),
                Arrays.asList(commitMetric)
        );

        // when
        Modification modification1 = new Modification(filename);
        Commit commit1 = createCommit(author1, modification1);
        versionControlledFile.registerCommit(commit1);
        Modification modification2 = new Modification(filename);
        Commit commit2 = createCommit(author2, modification2);
        versionControlledFile.registerCommit(commit2);
        Modification modification3 = new Modification(filename);
        Commit commit3 = createCommit(author1, modification3);
        versionControlledFile.registerCommit(commit3);

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactlyInAnyOrder(author1, author2);

        verify(commitMetric, times(3)).registerCommit(any());
        verify(commitMetric, times(1)).registerCommit(eq(commit1));
        verify(commitMetric, times(1)).registerCommit(eq(commit2));
        verify(commitMetric, times(1)).registerCommit(eq(commit3));

        verify(modificationMetric, times(3)).registerModification(any());
        verify(modificationMetric, times(1)).registerModification(eq(modification1));
        verify(modificationMetric, times(1)).registerModification(eq(modification2));
        verify(modificationMetric, times(1)).registerModification(eq(modification3));
    }

    private Commit createCommit(String author, Modification modification) {
        return new Commit(author, Arrays.asList(modification), LocalDateTime.now());
    }

}