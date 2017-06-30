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
        val name = "Name"
        val type = NodeType.Folder
        val node1 = Node(name, type)
        val node2 = Node(name, type)

        val newNode = merger.merge(node1, node2)

        assertThat(newNode.name, `is`(name))
    }

    @Test
    fun merging_nodes_should_prevail_type() {
        val name = "Name"
        val type = NodeType.File
        val node1 = Node(name, type)
        val node2 = Node(name, type)

        val newNode = merger.merge(node1, node2)

        assertThat(newNode.type, `is`(type))
    }

    @Test
    fun merging_nodes_should_merge_children() {
        val name = "Name"
        val type = NodeType.File
        val child1 = Node("child1", NodeType.File)
        val child2 = Node("child2", NodeType.Folder)
        val child1_littleBitDifferent = Node("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
        val node1 = Node(name, type, mapOf(), "", listOf(child1_littleBitDifferent))
        val node2 = Node(name, type, mapOf(), "", listOf(child1, child2))

        val newNode = merger.merge(node1, node2)

        assertThat(newNode.children, hasSize(2))
        assertThat(newNode.children!![0].name, `is`(child1.name))
        assertThat(newNode.children!![0].type, `is`(child1.type))
        assertThat(newNode.children!![1].name, `is`(child2.name))
        assertThat(newNode.children!![1].type, `is`(child2.type))
    }

    @Test
    fun merging_empty_nodes_should_return_empty_nodelist(){
        val nodeList = merger.mergeNodeLists(listOf())
        assertThat(nodeList, hasSize(0))
    }

    @Test
    fun merging_single_nodeList_should_return_same_nodelist(){
        val nodeList = listOf(Node("node", NodeType.File, mapOf()))
        val actualNodeList = merger.mergeNodeLists(listOf(nodeList))
        assertThat(actualNodeList, `is`(nodeList))
    }
}