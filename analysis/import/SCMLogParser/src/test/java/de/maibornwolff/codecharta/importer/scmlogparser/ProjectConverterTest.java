package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.model.input.Commit;
import de.maibornwolff.codecharta.model.input.VersionControlledFile;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

public class ProjectConverterTest {

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
        file1.registerCommit(new Commit("Author", Arrays.asList("File 1, File 2"), LocalDateTime.now()));

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
        file1.registerCommit(new Commit("Author", Arrays.asList("File 1, File 2"), LocalDateTime.now()));

        //when
        Project project = ProjectConverter.convert(projectname, Arrays.asList(file1), false);

        //then
        assertThat(project.getRootNode().getChildren().get(0).getAttributes().containsKey("authors")).isFalse();
    }


}
