package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class NodeMergerTest {
@Test
    fun `NodeMaxAttributeMerger should merge node with the same name`() {
        val name = "Name"
        val type = NodeType.File
        val link = "node1"
        val attrib1 = mapOf("attrib11" to 1.0)
        val node1 = MutableNode(name, type, attrib1, link, nodeMergingStrategy = NodeMaxAttributeMerger())
        val node2 = MutableNode(name, type)

        val newNode = node1.merge(listOf(node2))

        assertThat(newNode.name).isEqualTo(name)
        assertThat(newNode.type).isEqualTo(type)
        assertThat(newNode.link).isEqualTo(link)
        assertThat(newNode.attributes).hasSize(1)
        assertThat(newNode.attributes["attrib11"]).isEqualTo(1.0 as Any)
    }

    @Test
    fun `NodeMaxAttributeMerger should NOT merge children when children present`() {
        val child1 = MutableNode("child1", NodeType.File)
        val child2 = MutableNode("child2", NodeType.Folder)
        val child1Modified = MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
        val node1 =
                MutableNode(
                        "Name",
                        NodeType.File,
                        mapOf(),
                        "",
                        setOf(child1Modified),
                        nodeMergingStrategy = NodeMaxAttributeMerger(),
                           )
        val node2 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1, child2))

        val newNode = node1.merge(listOf(node2))

        assertThat(newNode.children).hasSize(0)
    }
}
