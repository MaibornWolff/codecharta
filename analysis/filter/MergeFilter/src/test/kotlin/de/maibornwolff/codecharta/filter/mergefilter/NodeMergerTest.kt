package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Assert.assertThat
import org.junit.Test

class DeepNodeMergerTest {
    var merger = NodeMerger()

    @Test
    fun merging_nodes_should_prevail_name() {
        // given
        val name = "Name"
        val node1 = Node(name, NodeType.Folder, mapOf(), "node1")
        val node2 = Node(name, NodeType.Folder)

        // when
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.name, `is`(name))
    }

    @Test
    fun merging_nodes_should_prevail_type() {
        // given
        val type = NodeType.File
        val node1 = Node("Name", type, mapOf(), "node1")
        val node2 = Node("Name", type)

        // when
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.type, `is`(type))
    }

    @Test
    fun merging_nodes_should_prevail_link() {
        // given
        val link = "node1"
        val node1 = Node("Name", NodeType.File, mapOf(), link)
        val node2 = Node("Name", NodeType.File)

        // when
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.link, `is`(link))
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
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.children, hasSize(2))
        assertThat(newNode.children!![0].name, `is`(child1.name))
        assertThat(newNode.children!![0].type, `is`(child1.type))
        assertThat(newNode.children!![1].name, `is`(child2.name))
        assertThat(newNode.children!![1].type, `is`(child2.type))
    }

    @Test
    fun merging_empty_nodes_should_return_empty_nodelist(){
        // given
        val emptyNodeList = listOf<List<Node>>()

        // when
        val nodeList = merger.mergeNodeLists(emptyNodeList)

        // then
        assertThat(nodeList, hasSize(0))
    }

    @Test
    fun merging_single_nodeList_should_return_same_nodelist(){
        // given
        val nodeList = listOf(Node("node", NodeType.File, mapOf()))

        // when
        val actualNodeList = merger.mergeNodeLists(listOf(nodeList))

        // then
        assertThat(actualNodeList, `is`(nodeList))
    }
}