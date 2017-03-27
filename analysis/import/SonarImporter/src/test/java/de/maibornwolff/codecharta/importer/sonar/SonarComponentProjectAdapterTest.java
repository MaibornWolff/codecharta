package de.maibornwolff.codecharta.importer.sonar;

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.importer.sonar.model.Component;
import de.maibornwolff.codecharta.importer.sonar.model.Measure;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import org.junit.Test;

import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertThat;

public class SonarComponentProjectAdapterTest {
    @Test
    public void should_insert_a_node_from_measure() {
        // given
        String metric = "metric";
        String value = "50.0";
        Measure measure = new Measure(metric, value);
        String id = "id";
        String key = "key";
        String name = "name";
        String path = "someFileName";
        String language = "java";
        Qualifier qualifier = Qualifier.FIL;
        Component component = new Component(id, key, name, path, language, qualifier, ImmutableList.of(measure));
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter("project");

        // when
        project.addComponentAsNode(component);

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(1));
        Node actualNode = project.getRootNode().getChildren().get(0);
        assertThat(actualNode.getName(), is(path));
        assertThat(actualNode.getType(), is(NodeType.File));
        assertThat(actualNode.getAttributes(), hasEntry(metric, Double.valueOf(value)));
        assertThat(actualNode.getChildren(), hasSize(0));
        assertThat(actualNode.getLink(), is(""));
    }
}