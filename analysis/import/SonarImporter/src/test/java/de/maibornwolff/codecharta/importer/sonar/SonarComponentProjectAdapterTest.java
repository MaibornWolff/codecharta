package de.maibornwolff.codecharta.importer.sonar;

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.importer.sonar.model.Component;
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap;
import de.maibornwolff.codecharta.importer.sonar.model.Measure;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;
import org.junit.Test;

import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertThat;

public class SonarComponentProjectAdapterTest {

    @Test
    public void should_insert_a_node_from_file_component_without_key_and_use_name_as_backup_value() {
        // given
        Measure measure = new Measure("metric", "50.0");
        String name = "name";
        Component component = new Component("id", null, name, "path", Qualifier.FIL, ImmutableList.of(measure));
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter("project");

        // when
        project.addComponentAsNode(component);

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(1));
        Node actualNode = project.getRootNode().getChildren().get(0);
        assertThat(actualNode.getName(), is(name));
    }

    @Test
    public void should_insert_a_node_from_file_component_without_key_and_name_and_use_id_as_backup_value() {
        // given
        Measure measure = new Measure("metric", "50.0");
        String id = "id";
        Component component = new Component(id, null, null, null, Qualifier.FIL, ImmutableList.of(measure));
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter("project");

        // when
        project.addComponentAsNode(component);

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(1));
        Node actualNode = project.getRootNode().getChildren().get(0);
        assertThat(actualNode.getName(), is(id));
    }


    @Test
    public void should_insert_a_node_from_file_component() {
        // given
        String metric = "metric";
        String value = "50.0";
        Measure measure = new Measure(metric, value);
        String id = "id";
        String key = "key";
        String name = "name";
        String path = "someFileName";
        Component component = new Component(id, key, name, path, Qualifier.FIL, ImmutableList.of(measure));
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter("project");

        // when
        project.addComponentAsNode(component);

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(1));
        Node actualNode = project.getRootNode().getChildren().get(0);
        assertThat(actualNode.getName(), is(key));
        assertThat(actualNode.getType(), is(NodeType.File));
        assertThat(actualNode.getAttributes(), hasEntry(metric, Double.valueOf(value)));
        assertThat(actualNode.getChildren(), hasSize(0));
        assertThat(actualNode.getLink(), is(""));
    }

    @Test
    public void should_ignore_string_measures() {
        // given
        Measure measure = new Measure("metric", "bla");
        Component component = new Component("id", "key", "name", "path", Qualifier.FIL, ImmutableList.of(measure));
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter("project");

        // when
        project.addComponentAsNode(component);

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(1));
        Node actualNode = project.getRootNode().getChildren().get(0);
        assertThat(actualNode.getAttributes().keySet(), hasSize(0));
    }

    @Test
    public void should_insert_a_file_node_from_uts_component() {
        // given
        Component component = new Component("id", "key", "name", "path", Qualifier.UTS, ImmutableList.of());
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter("project");

        // when
        project.addComponentAsNode(component);

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(1));
        Node actualNode = project.getRootNode().getChildren().get(0);
        assertThat(actualNode.getType(), is(NodeType.File));
    }

    @Test
    public void should_insert_a_folder_node_from_dir_component() {
        // given
        Component component = new Component("id", "key", "name", "path", Qualifier.DIR, ImmutableList.of());
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter("project");

        // when
        project.addComponentAsNode(component);

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(1));
        Node actualNode = project.getRootNode().getChildren().get(0);
        assertThat(actualNode.getType(), is(NodeType.Folder));
    }

    @Test
    public void should_insert_component_from_component_map() {
        // given
        Component component = new Component("id", "key", "name", "path", Qualifier.FIL, ImmutableList.of());
        ComponentMap components = new ComponentMap();
        components.updateComponent(component);
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter("project");

        // when
        project.addComponentMapsAsNodes(components);

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(1));
    }

    @Test
    public void should_insert_component_by_path_if_configured(){
        // given
        String path = "someFileName";
        Component component = new Component("id", "key", "name", path, Qualifier.FIL, ImmutableList.of());
        SonarComponentProjectAdapter project = new SonarComponentProjectAdapter("project", SonarCodeURLLinker.NULL, MetricNameTranslator.TRIVIAL, true);

        // when
        project.addComponentAsNode(component);

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(1));
        Node actualNode = project.getRootNode().getChildren().get(0);
        assertThat(actualNode.getName(), is(path));
        assertThat(actualNode.getType(), is(NodeType.File));

    }
}