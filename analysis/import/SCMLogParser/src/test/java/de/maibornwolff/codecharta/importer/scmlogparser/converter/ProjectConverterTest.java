package de.maibornwolff.codecharta.importer.scmlogparser.converter;

import de.maibornwolff.codecharta.importer.scmlogparser.converter.ProjectConverter;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.model.Project;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

public class ProjectConverterTest {

    private final MetricsFactory metricsFactory = mock(MetricsFactory.class);

    private static List<Modification> modificationsByFilename(String... filenames) {
        return Stream.of(filenames).map(Modification::new).collect(Collectors.toList());
    }

    @Test
    public void canCreateAnEmptyProject() throws Exception {
        // given
        ProjectConverter projectConverter = new ProjectConverter(true);
        String projectname = "Projectname";

        // when
        Project project = projectConverter.convert(projectname, Collections.emptyList());

        //then
        assertThat(project.getNodes()).hasSize(0);
        assertThat(project.getProjectName()).isEqualTo(projectname);
    }

    @Test
    public void canConvertProjectWithAuthors() {
        //given
        ProjectConverter projectConverter = new ProjectConverter(true);
        String projectname = "ProjectWithAuthors";
        VersionControlledFile file1 = new VersionControlledFile("File 1", metricsFactory);
        file1.registerCommit(new Commit("Author", modificationsByFilename("File 1, File 2"), LocalDateTime.now()));

        //when
        Project project = projectConverter.convert(projectname, Arrays.asList(file1));

        //then
        assertThat(project.getRootNode().getChildren().get(0).getAttributes().containsKey("authors")).isTrue();
    }

    @Test
    public void canConvertProjectWithoutAuthors() {
        //given
        ProjectConverter projectConverter = new ProjectConverter(false);
        String projectname = "ProjectWithoutAuthors";
        VersionControlledFile file1 = new VersionControlledFile("File 1", metricsFactory);
        file1.registerCommit(new Commit("Author", modificationsByFilename("File 1, File 2"), LocalDateTime.now()));

        //when
        Project project = projectConverter.convert(projectname, Arrays.asList(file1));

        //then
        assertThat(project.getRootNode().getChildren().get(0).getAttributes().containsKey("authors")).isFalse();
    }


}
