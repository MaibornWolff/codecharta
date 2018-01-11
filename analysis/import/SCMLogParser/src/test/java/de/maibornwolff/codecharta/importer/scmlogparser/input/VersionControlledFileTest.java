package de.maibornwolff.codecharta.importer.scmlogparser.input;

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.CommitMetric;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.ModificationMetric;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

public class VersionControlledFileTest {

    @Test
    public void versionControlledFileHoldsInitallyOnlyTheFilename() {
        // given
        MetricsFactory metricsFactory = mock(MetricsFactory.class);
        String filename = "filename";

        // when
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename, metricsFactory);

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getActualFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).isEmpty();
        assertThat(versionControlledFile.markedDeleted()).isFalse();
    }


    @Test
    public void canRegisterMetricsByMetricsFactory() {
        // given

        ModificationMetric modificationMetric = mock(ModificationMetric.class);
        when(modificationMetric.metricName()).thenReturn("modificationMetric");
        when(modificationMetric.value()).thenReturn(1);

        CommitMetric commitMetric = mock(CommitMetric.class);
        when(commitMetric.metricName()).thenReturn("commitMetric");
        when(commitMetric.value()).thenReturn(2);

        MetricsFactory metricsFactory = mock(MetricsFactory.class);
        when(metricsFactory.createCommitMetrics()).thenReturn(Arrays.asList(commitMetric));
        when(metricsFactory.createModificationMetrics()).thenReturn(Arrays.asList(modificationMetric));

        VersionControlledFile versionControlledFile = new VersionControlledFile(
                "filename",
                metricsFactory
        );

        // when
        Map<String, Number> metricsMap = versionControlledFile.getMetricsMap();

        // then
        assertThat(metricsMap).hasSize(2);
        assertThat(versionControlledFile.getMetricValue("modificationMetric"))
                .isEqualTo(1);
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
    public void canRegisterASimpleCommit() {
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
        assertThat(versionControlledFile.getActualFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactly(author);
        assertThat(versionControlledFile.markedDeleted()).isFalse();

        verify(modificationMetric, times(1)).registerModification(any());
        verify(modificationMetric, times(1)).registerModification(eq(modification));

        verify(commitMetric, times(1)).registerCommit(any());
        verify(commitMetric, times(1)).registerCommit(eq(commit));
    }

    @Test
    public void getAuthorsReturnsAllAuthors() {
        // given
        String filename = "filename";
        String author1 = "An Author";
        String author2 = "2nd Author";
        VersionControlledFile versionControlledFile = new VersionControlledFile(
                filename, Collections.emptyList(), Collections.emptyList()
        );

        // when
        Modification modification1 = new Modification(filename);
        versionControlledFile.registerCommit(createCommit(author1, modification1));
        Modification modification2 = new Modification(filename);
        versionControlledFile.registerCommit(createCommit(author2, modification2));
        Modification modification3 = new Modification(filename);
        versionControlledFile.registerCommit(createCommit(author1, modification3));

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactlyInAnyOrder(author1, author2);
    }

    @Test
    public void deletionMarksFileAsDeleted() {
        // given
        String filename = "filename";
        VersionControlledFile versionControlledFile = new VersionControlledFile(
                filename, Collections.emptyList(), Collections.emptyList()
        );

        // when
        List<Modification> modifications = Arrays.asList(
                new Modification(filename),
                new Modification(filename, Modification.Type.DELETE),
                new Modification(filename)
        );
        modifications.stream()
                .forEach(
                        mod -> versionControlledFile.registerCommit(createCommit("An Author", mod))
                );

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getActualFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.markedDeleted()).isTrue();
    }

    @Test
    public void renamingChangesActualFilename() {
        // given
        ModificationMetric modificationMetric = mock(ModificationMetric.class);
        CommitMetric commitMetric = mock(CommitMetric.class);

        String oldFilename = "old filename";
        String filename = "filename";
        VersionControlledFile versionControlledFile = new VersionControlledFile(
                filename,
                Arrays.asList(modificationMetric),
                Arrays.asList(commitMetric)
        );

        // when
        // anti-chronological ordering
        List<Modification> modifications = Arrays.asList(
                new Modification(filename),
                new Modification(filename, oldFilename, Modification.Type.RENAME),
                new Modification(oldFilename),
                new Modification(filename)
        );
        modifications.stream()
                .forEach(
                        mod -> versionControlledFile.registerCommit(createCommit("An Author", mod))
                );

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(oldFilename);
        assertThat(versionControlledFile.getActualFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.markedDeleted()).isFalse();

        verify(modificationMetric, times(3)).registerModification(any());
        verify(commitMetric, times(3)).registerCommit(any());
    }

    private Commit createCommit(String author, Modification modification) {
        return new Commit(author, Arrays.asList(modification), LocalDateTime.now());
    }

}