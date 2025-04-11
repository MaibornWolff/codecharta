package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class RecursiveNodeMergerTest {
    private val merger = RecursiveNodeMergerStrategy()

    @Test
    fun `should merge nodes`() {
        val node1 = MutableNode("Name", NodeType.File)
        val node2 = MutableNode("Name", NodeType.Folder)

        val nodeList = merger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))
        assertEquals(nodeList.size, 1)
    }

    @Test
    fun `should merge empty nodes`() {
        val nodeList = merger.mergeNodeLists(listOf())
        assertEquals(nodeList.size, 0)
    }

    @Test
    fun `should merge single node`() {
        val nodeList = listOf(MutableNode("node", NodeType.File, mapOf()))
        val actualNodeList = merger.mergeNodeLists(listOf(nodeList))
        assertEquals(actualNodeList, nodeList)
    }

    @Test
    fun `should merge nodes with children with the same name`() {
        val child1 = MutableNode("child1", NodeType.File)
        val child2 = MutableNode("child2", NodeType.Folder)
        val child1Modified = MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
        val node1 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1Modified))
        val node2 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1, child2))

        val newNode = merger.mergeNodeLists(listOf(listOf(node2), listOf(node1)))[0]

        assertEquals(newNode.children.size, 2)
        assertEquals(newNode.children.toList()[0].name, child1.name)
        assertEquals(newNode.children.toList()[0].type, child1.type)
        assertEquals(newNode.children.toList()[1].name, child2.name)
        assertEquals(newNode.children.toList()[1].type, child2.type)

        assertEquals(newNode.children.toList()[0].attributes.size, 1)
    }

    @Test
    fun `should merge node list with two root nodes`() {
        val node11 = MutableNode("Name1", NodeType.File)
        val node12 = MutableNode("Name2", NodeType.File)
        val node2 = MutableNode("Name1", NodeType.Folder)

        val nodeList = merger.mergeNodeLists(listOf(listOf(node11, node12), listOf(node2)))
        assertEquals(nodeList.size, 2)
    }
}
