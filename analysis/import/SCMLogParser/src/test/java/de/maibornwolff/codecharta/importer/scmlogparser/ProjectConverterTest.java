package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.model.input.Commit;
import de.maibornwolff.codecharta.model.input.Modification;
import de.maibornwolff.codecharta.model.input.VersionControlledFile;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

public class ProjectConverterTest {

    private static List<Modification> modificationsByFilename(String... filenames) {
        return Stream.of(filenames).map(Modification::new).collect(Collectors.toList());
    }

    @Test
    public void canCreateAnEmptyProject() throws Exception {
        // given
        String projectname = "Projectname";

        // when
        Project project = ProjectConverter.convert(projectname, Collections.emptyList(), true);

        //then
        assertThat(project.getNodes()).hasSize(0);
        assertThat(project.getProjectName()).isEqualTo(projectname);
    }

    @Test
    public void canConvertProjectWithAuthors() {
        //given
        String projectname = "ProjectWithAuthors";
        VersionControlledFile file1 = new VersionControlledFile("File 1");
        file1.registerCommit(new Commit("Author", modificationsByFilename("File 1, File 2"), LocalDateTime.now()));

        //when
        Project project = ProjectConverter.convert(projectname, Arrays.asList(file1), true);

        //then
        assertThat(project.getRootNode().getChildren().get(0).getAttributes().containsKey("authors")).isTrue();
    }

    @Test
    public void canConvertProjectWithoutAuthors() {
        //given
        String projectname = "ProjectWithoutAuthors";
        VersionControlledFile file1 = new VersionControlledFile("File 1");
        file1.registerCommit(new Commit("Author", modificationsByFilename("File 1, File 2"), LocalDateTime.now()));

        //when
        Project project = ProjectConverter.convert(projectname, Arrays.asList(file1), false);

        //then
        assertThat(project.getRootNode().getChildren().get(0).getAttributes().containsKey("authors")).isFalse();
    }


}
