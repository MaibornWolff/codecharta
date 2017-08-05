package de.maibornwolff.codecharta.model;

import com.google.common.collect.ImmutableMap;
import de.maibornwolff.codecharta.nodeinserter.FileSystemPath;
import org.junit.Test;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import static org.hamcrest.CoreMatchers.hasItem;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasSize;

public class NodeTest {

    @Test
    public void getPathOfChild_of_valid_child_should_return_path() {
        // given
        Node node11 = new Node("node11", NodeType.File);
        List<Node> node1Children = Arrays.asList(node11);
        Node root = new Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children);

        // when
        Path pathOfChild = root.getPathOfChild(node11);

        // then
        assertThat(pathOfChild.isSingle(), is(true));
        assertThat(pathOfChild.head(), is("node11"));
    }

    @Test(expected = NoSuchElementException.class)
    public void getPathOfChild_of_invalid_child_should_throw_exception() {
        // given
        Node node11 = new Node("node11", NodeType.File);
        List<Node> node1Children = Arrays.asList(node11);
        Node root = new Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children);

        // when
        root.getPathOfChild(new Node("node11", NodeType.Folder));

        // then throw
    }

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

        // when
        List<Node> leafs = root.getLeafObjects().collect(Collectors.toList());

        // then
        assertThat(leafs, hasSize(3));
        assertThat(leafs, hasItem(node11));
        assertThat(leafs, hasItem(node12));
        assertThat(leafs, hasItem(node21));
    }

    @Test
    public void getPathsToLeafs_of_simple_tree() {
        // given
        Node node1 = new Node("node1", NodeType.Folder);
        Path pathToNode1 = new FileSystemPath("node1");
        Node root = new Node("root", NodeType.Folder, ImmutableMap.of(), "", Arrays.asList(node1));

        // when
        List<Path> pathsToLeafs = root.getPathsToLeaves().collect(Collectors.toList());

        // then
        assertThat(pathsToLeafs, hasSize(1));
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode1));
    }

    @Test
    public void getPathsToLeafs() {
        // given
        Node node11 = new Node("node11", NodeType.File);
        Path pathToNode11 = new FileSystemPath("node1/node11");
        Node node12 = new Node("node12", NodeType.File);
        Path pathToNode12 = new FileSystemPath("node1/node12");
        List<Node> node1Children = Arrays.asList(node11, node12);
        Node node1 = new Node("node1", NodeType.Folder, ImmutableMap.of(), "", node1Children);
        Node node21 = new Node("node21", NodeType.Folder);
        Path pathToNode21 = new FileSystemPath("node2/node21");
        List<Node> node2Children = Arrays.asList(node21);
        Node node2 = new Node("node2", NodeType.Folder, ImmutableMap.of(), "", node2Children);
        Node root = new Node("root", NodeType.Folder, ImmutableMap.of(), "", Arrays.asList(node1, node2));

        // when
        List<Path> pathsToLeafs = root.getPathsToLeaves().collect(Collectors.toList());

        // then
        assertThat(pathsToLeafs, hasSize(3));
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode11));
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode12));
        assertThat(pathsToLeafs, PathMatcher.containsPath(pathToNode21));
    }
}