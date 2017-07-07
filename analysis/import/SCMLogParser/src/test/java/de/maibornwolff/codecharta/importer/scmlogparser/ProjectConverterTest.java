package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.model.Project;
import org.junit.Test;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

public class ProjectConverterTest {

    @Test
    public void canCreateAnEmptyProject() throws Exception {
        // given
        String projectname = "Projectname";

        // when
        Project project = ProjectConverter.convert(projectname, Collections.emptyList());

        //then
        assertThat(project.getNodes()).hasSize(0);
        assertThat(project.getProjectName()).isEqualTo(projectname);
    }


}
