package de.maibornwolff.codecharta.model;

import org.junit.Test;

import java.util.Arrays;
import java.util.Map;

import static de.maibornwolff.codecharta.model.TreeCreator.createTree;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

public class TreeTest {
    @Test
    public void getNodeBy_trivial_should_return_same_tree() {
        Tree tree = createTree(new Path(Arrays.asList("bla")), createTree());

        assertThat(tree.getNodeBy(Path.TRIVIAL).get(), is(tree));
    }

    @Test
    public void getNode_of_simple_tree_should_return_this_tree() {
        Tree tree = createTree();

        Map nodes = tree.getNodes();

        assertThat(nodes.size(), is(1));
        assertThat(nodes.keySet().contains(Path.TRIVIAL), is(true));
        assertThat(nodes.values().contains(tree), is(true));
    }

    @Test
    public void getLeaves_of_simple_tree_should_return_this_leaf() {
        Tree tree = createTree();

        Map leaves = tree.getLeaves();

        assertThat(leaves.size(), is(1));
        assertThat(leaves.keySet().contains(Path.TRIVIAL), is(true));
        assertThat(leaves.values().contains(tree), is(true));
    }

    @Test
    public void getNode_should_return_nodes() {
        Tree innerTree = createTree();
        Path pathToInnerTree = new Path(Arrays.asList("bla"));
        Tree tree = createTree(pathToInnerTree, innerTree);

        Map nodes = tree.getNodes();

        assertThat(nodes.size(), is(2));
        assertThat(nodes.keySet().contains(Path.TRIVIAL), is(true));
        assertThat(nodes.values().contains(tree), is(true));
        assertThat(nodes.keySet().contains(pathToInnerTree), is(true));
        assertThat(nodes.values().contains(innerTree), is(true));
    }

    @Test
    public void getLeaves_should_return_leaves() {
        Tree innerTree = createTree();
        Path pathToInnerTree = new Path(Arrays.asList("bla"));
        Tree tree = createTree(pathToInnerTree, innerTree);

        Map leaves = tree.getLeaves();

        assertThat(leaves.size(), is(1));
        assertThat(leaves.keySet().contains(pathToInnerTree), is(true));
        assertThat(leaves.values().contains(innerTree), is(true));
    }
}