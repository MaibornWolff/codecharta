package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.Matchers.hasSize
import org.junit.Assert.assertThat
import org.junit.Test

class FlatNodeMergerTest {
    var merger = FlatNodeMerger()

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
    fun merging_nodes_should_merge_attibutes() {
        // given
        val attrib1 = mapOf <String, Any>("attrib11" to 1.0)
        val node1 = Node("Name", NodeType.File, attrib1)
        val node2 = Node("Name", NodeType.File, null)

        // when
        val newNode = merger.merge(node1, node2)

        // then
    }

    @Test
    fun merging_nodes_should_not_merge_children() {
        // given
        val child1 = Node("child1", NodeType.File)
        val child2 = Node("child2", NodeType.Folder)
        val child1_littleBitDifferent = Node("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", listOf())
        val node1 = Node("Name", NodeType.File, mapOf(), "", listOf(child1_littleBitDifferent))
        val node2 = Node("Name", NodeType.File, mapOf(), "", listOf(child1, child2))

        // when
        val newNode = merger.merge(node1, node2)

        // then
        assertThat(newNode.children, hasSize(0))
    }

}