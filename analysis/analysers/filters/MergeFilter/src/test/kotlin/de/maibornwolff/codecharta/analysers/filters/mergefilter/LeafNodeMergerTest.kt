package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class LeafNodeMergerTest {
    @Test
    fun `should merge nodes with same name`() {
        val fittingMerger = LeafNodeMergerStrategy(false)
        val node1 = MutableNode("Name", NodeType.File)
        val node2 = MutableNode("Name", NodeType.Folder)

        val nodeList = fittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))
        assertEquals(nodeList.size, 1)
    }

    @Test
    fun `should merge nodes with children and with same name`() {
        val fittingMerger = LeafNodeMergerStrategy(false)
        val child1 = MutableNode("child1", NodeType.File)
        val child2 = MutableNode("child2", NodeType.Folder)
        val child1Modified = MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
        val node1 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1Modified))
        val node2 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1, child2))

        val newNode = fittingMerger.mergeNodeLists(listOf(listOf(node2), listOf(node1)))[0]

        assertEquals(newNode.children.size, 2)
        assertEquals(newNode.children.toList()[0].name, child1.name)
        assertEquals(newNode.children.toList()[0].type, child1.type)
        assertEquals(newNode.children.toList()[1].name, child2.name)
        assertEquals(newNode.children.toList()[1].type, child2.type)
        assertEquals(newNode.children.toList()[0].size, 1)
    }

    @Test
    fun `should merge children of nodes`() {
        val fittingMerger = LeafNodeMergerStrategy(false)
        val childA = MutableNode("A", NodeType.File, mapOf("a" to 0))
        val childB = MutableNode("B", NodeType.Folder, mapOf(), "", setOf(MutableNode("A", NodeType.File)))
        val root1 = MutableNode("root", NodeType.Folder, mapOf(), "", setOf(childA, childB))

        val childA2 = MutableNode("A", NodeType.File)
        val childB2 = MutableNode("B", NodeType.Folder, mapOf(), "", setOf(MutableNode("A", NodeType.File)))
        val root2 = MutableNode("root", NodeType.Folder, mapOf(), "", setOf(childA2, childB2))

        val newRoot = fittingMerger.mergeNodeLists(listOf(listOf(root1), listOf(root2)))[0]

        assertEquals(newRoot.children.size, 2)
        assertEquals((newRoot.getNodeBy(Path(listOf("B", "A"))) as MutableNode).attributes.size, 0)
    }

    @Test
    fun `should merge leafs`() {
        val fittingMerger = LeafNodeMergerStrategy(false)
        val child1Modified = MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
        val node1 = MutableNode("root", NodeType.File, mapOf(), "", setOf(child1Modified))
        val child1 = MutableNode("child1", NodeType.File)
        val intermediateNode = MutableNode("intermediateNode", NodeType.File, mapOf(), "", setOf(child1))
        val node2 = MutableNode("root", NodeType.File, mapOf(), "", setOf(intermediateNode))

        val newNode = fittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

        assertEquals(newNode.children.size, 1)
        assertEquals(newNode.children.toList()[0].name, child1.name)
        assertEquals(newNode.children.toList()[0].type, child1.type)
    }

    @Test
    fun `should handle empty nodes`() {
        val fittingMerger = LeafNodeMergerStrategy(false)
        val nodeList = fittingMerger.mergeNodeLists(listOf())
        assertEquals(nodeList.size, 0)
    }

    @Test
    fun `should merge single node list`() {
        val fittingMerger = LeafNodeMergerStrategy(false)
        val nodeList = listOf(MutableNode("node", NodeType.File, mapOf()))
        val actualNodeList = fittingMerger.mergeNodeLists(listOf(nodeList))

        assertEquals(actualNodeList, nodeList)
    }

    @Test
    fun `should merge nodes with children in misfitting mode`() {
        val misfittingMerger = LeafNodeMergerStrategy(true)
        val child1 = MutableNode("child1", NodeType.File)
        val child2 = MutableNode("child2", NodeType.Folder)
        val child1Modified = MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
        val node1 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1Modified))
        val node2 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1, child2))

        val newNode = misfittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

        assertEquals(newNode.children.size, 2)
        assertEquals(newNode.children.toList()[0].name, child1.name)
        assertEquals(newNode.children.toList()[0].type, child1.type)
        assertEquals(newNode.children.toList()[1].name, child2.name)
        assertEquals(newNode.children.toList()[1].type, child2.type)
    }
}
