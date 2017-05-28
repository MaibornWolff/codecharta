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
    private final CSVProjectAdapter project = new CSVProjectAdapter("test");

    private static InputStream toInputStream(String content) {
        return new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    public void should_ignore_wrong_row_content() throws UnsupportedEncodingException {
        // when
        project.addProjectFromCsv(toInputStream("head\nnoValidContent\n"));

        // then
        assertThat(project.getRootNode().getChildren(), hasSize(0));
    }

    @Test
    public void should_read_node_name_from_fourth_column() throws UnsupportedEncodingException {
        String name = "someName";
        // when
        project.addProjectFromCsv(toInputStream("someContent\nprojectName,blubb2,blubb3," + name));

        // then
        List<Node> rootNode = project.getRootNode().getChildren();
        assertThat(rootNode.size(), is(1));
        assertThat(rootNode.iterator().next().getName(), is(name));
    }

    @Test
    public void should_read_node_with_name_only_once() throws UnsupportedEncodingException {
        String name = "someName";
        // when
        project.addProjectFromCsv(toInputStream("someContent\nprojectName,blubb2,blubb3," + name));
        project.addProjectFromCsv(toInputStream("someContent\nprojectName,blubb2,blubb3," + name));

        // then
        assertThat(project.getRootNode().getChildren().size(), is(1));
    }

    @Test
    public void should_create_nodes_for_directories() throws UnsupportedEncodingException {
        // given
        String directoryName = "someNodeName";

        // when
        project.addProjectFromCsv(toInputStream("someContent\nprojectName,blubb2,blubb3," + directoryName + "\\someFile"));

        // then
        assertThat(project.getRootNode().getChildren().size(), is(1));
        Node node = project.getRootNode().getChildren().iterator().next();
        assertThat(node.getName(), is(directoryName));
        assertThat(node.getChildren().size(), is(1));
    }

    @Test
    public void should_read_node_attributes_from_fifth_column() throws UnsupportedEncodingException {
        // given
        String attribName = "attname";
        String attribVal = "\"0,1\"";
        float attValFloat = 0.1F;

        // when
        project.addProjectFromCsv(toInputStream("head1,head2,head3,head4," + attribName + "\nprojectName,blubb2,blubb3,blubb4," + attribVal + "\n"));

        // then
        Map<String, Object> nodeAttributes = project.getRootNode().getChildren().iterator().next().getAttributes();
        assertThat(nodeAttributes.size(), is(1));
        assertThat(nodeAttributes.get(attribName), is(attValFloat));
    }
}