package de.maibornwolff.codecharta.model;

import com.google.common.collect.ImmutableMap;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class NodeTest {
    @Test
    public void getLeafs_should_return_leafs() {
        // given
        Node node11 = new Node("node11", NodeType.File);
        Node node12 = new Node("node12", NodeType.File);
        List<Node> node1Children = Arrays.asList(node11, node12);
        Node node1 = new Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children);
        Node node21 = new Node("node21", NodeType.Folder);
        List<Node> node2Children = Arrays.asList(node21);
        Node node2 = new Node("node2", NodeType.Folder, ImmutableMap.of(), "", node2Children);
        Node root = new Node("root", NodeType.Folder, ImmutableMap.of(), "", Arrays.asList(node1, node2));
        List<Node> expectedLeafs = Arrays.asList(node11, node12, node21);

        // when
        List<Node> leafs = root.getLeafs().collect(Collectors.toList());

        // then
        assertThat(leafs, is(expectedLeafs));
    }
}