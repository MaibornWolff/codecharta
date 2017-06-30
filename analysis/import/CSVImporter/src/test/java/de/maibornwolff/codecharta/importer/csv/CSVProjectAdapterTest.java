package de.maibornwolff.codecharta.importer.csv;

import de.maibornwolff.codecharta.model.Node;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasSize;

public class CSVProjectAdapterTest {
    private final CSVProjectAdapter project = new CSVProjectAdapter("test", '\\', ',');

    private static InputStream toInputStream(String content) {
        return new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    public void should_ignore_row_if_no_path_column_present() throws UnsupportedEncodingException {
        // when
        project.addProjectFromCsv(toInputStream("head,path\nnoValidContent\n"));

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(0));
    }

    @Test
    public void should_read_node_name_from_specified_path_column() throws UnsupportedEncodingException {
        String name = "someName";
        // when
        project.addProjectFromCsv(toInputStream("someContent,,path\nprojectName,blubb2," + name));

        // then
        List<Node> rootNode = project.getRootNode().getChildren();
        assertThat(rootNode.size(), is(1));
        assertThat(rootNode.iterator().next().getName(), is(name));
    }

    @Test
    public void should_read_node_with_name_only_once() throws UnsupportedEncodingException {
        String name = "someName";
        // when
        project.addProjectFromCsv(toInputStream("someContent\n" + name));
        project.addProjectFromCsv(toInputStream("someContent\n" + name));

        // then
        assertThat(project.getRootNode().getChildren().size(), is(1));
    }

    @Test
    public void should_create_nodes_for_directories() throws UnsupportedEncodingException {
        // given
        String directoryName = "someNodeName";

        // when
        project.addProjectFromCsv(toInputStream("someContent\n" + directoryName + "\\someFile"));

        // then
        assertThat(project.getRootNode().getChildren().size(), is(1));
        Node node = project.getRootNode().getChildren().iterator().next();
        assertThat(node.getName(), is(directoryName));
        assertThat(node.getChildren().size(), is(1));
    }

    @Test
    public void should_read_node_attributes_if_metric_values() throws UnsupportedEncodingException {
        // given
        String attribName = "attname";
        String attribVal = "\"0,1\"";
        float attValFloat = 0.1F;

        // when
        project.addProjectFromCsv(toInputStream("head1,path,head3,head4," + attribName + "\nprojectName,\"9900,01\",\"blubb\",1.0," + attribVal + "\n"));

        // then
        Map<String, Object> nodeAttributes = project.getRootNode().getChildren().iterator().next().getAttributes();
        assertThat(nodeAttributes.size(), is(3));
        assertThat(nodeAttributes.get(attribName), is(attValFloat));
    }
}