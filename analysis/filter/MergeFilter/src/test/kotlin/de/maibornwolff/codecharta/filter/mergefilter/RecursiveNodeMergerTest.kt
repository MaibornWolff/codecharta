package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Assert.assertThat
import org.junit.Test

class RecursiveNodeMergerTest {
    private val merger = RecursiveNodeMergerStrategy()

    @Test
    fun should_merge_nodes_with_same_name() {
        // given
        val node1 = Node("Name", NodeType.File)
        val node2 = Node("Name", NodeType.Folder)

        // when
        val nodeList = merger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))

        // then
        assertThat(nodeList, hasSize(1))
    }

    @Test
    fun merging_nodes_should_merge_children() {
        // given
        val child1 = Node("child1", NodeType.File)
        val child2 = Node("child2", NodeType.Folder)
        val child1_littleBitDifferent = Node("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
        val node1 = Node("Name", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
        val node2 = Node("Name", NodeType.File, mapOf(), "", listOf(child1, child2))

        // when
        val newNode = merger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

        // then
        assertThat(newNode.children, hasSize(2))
        assertThat(newNode.children!![0].name, `is`(child1.name))
        assertThat(newNode.children!![0].type, `is`(child1.type))
        assertThat(newNode.children!![1].name, `is`(child2.name))
        assertThat(newNode.children!![1].type, `is`(child2.type))
    }

    @Test
    fun merging_empty_nodes_should_return_empty_nodelist() {
        // given
        val emptyNodeList = listOf<List<Node>>()

        // when
        val nodeList = merger.mergeNodeLists(emptyNodeList)

        // then
        assertThat(nodeList, hasSize(0))
    }

    @Test
    fun merging_single_nodeList_should_return_same_nodelist() {
        // given
        val nodeList = listOf(Node("node", NodeType.File, mapOf()))

        // when
        val actualNodeList = merger.mergeNodeLists(listOf(nodeList))

        // then
        assertThat(actualNodeList, `is`(nodeList))
    }

    @Test
    fun merging_nodeList_with_two_root_nodes_should_return_two_root_nodes() {
        // given
        val node11 = Node("Name1", NodeType.File)
        val node12 = Node("Name2", NodeType.File)
        val node2 = Node("Name1", NodeType.Folder)

        // when
        val nodeList = merger.mergeNodeLists(listOf(listOf(node11, node12), listOf(node2)))

        // then
        assertThat(nodeList, hasSize(2))
    }

}