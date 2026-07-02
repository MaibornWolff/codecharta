package de.maibornwolff.codecharta.analysers.filters.edgefilter

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.InputStreamReader

class ProjectMergerTest {
    companion object {
        private const val TEST_EDGES_JSON_FILE = "coupling.json"
        private const val TEST_EDGES_JSON_FILE_2 = "coupling-empty-nodes.json"
        private const val TEST_EDGES_JSON_FILE_3 = "empty-but-descriptors.json"
    }

    @Test
    fun `should filter edges as node attributes`() {
        val originalProject =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE)!!)
            )
        val project = EdgeProjectBuilder(originalProject, '/').merge()
        val parent1 = getChildByName(project.rootNode.children.toMutableList(), "Parent 1")
        val parent2 = getChildByName(parent1.children.toMutableList(), "Parent 2")

        val leaf1 = getChildByName(project.rootNode.children.toMutableList(), "leaf 1")
        val leaf3 = getChildByName(parent1.children.toMutableList(), "leaf 3")
        val leaf4 = getChildByName(parent2.children.toMutableList(), "leaf 4")

        assertEquals(project.sizeOfEdges(), 6)
        assertEquals(project.size, 5)
        assertEquals(leaf1.attributes.size, 5)

        val leafs = listOf(leaf1, leaf3, leaf4) // Check test files
        val expectedPairingRates = listOf((90 + 30 + 70) / 3, (90 + 60 + 70) / 3, (60 + 80 + 60) / 3)
        val expectedAvgCommits = listOf(30 + 10 + 30, 30 + 40 + 30, 20 + 30 + 40)
        leafs.forEachIndexed { i, curLeaf ->
            assertEquals(getAttributeValue(curLeaf.attributes, "pairingRate"), expectedPairingRates[i])
            assertEquals(getAttributeValue(curLeaf.attributes, "avgCommits"), expectedAvgCommits[i])
        }
    }

    @Test
    fun `should filter edges as node attributes with empty nodes list in testfile`() {
        val originalProject =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE_2)!!)
            )
        val project = EdgeProjectBuilder(originalProject, '/').merge()

        val parent1 = getChildByName(project.rootNode.children.toMutableList(), "Parent 1")
        val parent2 = getChildByName(parent1.children.toMutableList(), "Parent 2")

        val leaf1 = getChildByName(project.rootNode.children.toMutableList(), "leaf 1")
        val leaf3 = getChildByName(parent1.children.toMutableList(), "leaf 3")
        val leaf4 = getChildByName(parent2.children.toMutableList(), "leaf 4")

        assertEquals(project.sizeOfEdges(), 6)
        assertEquals(leaf1.attributes.size, 2)

        val leafs = listOf(leaf1, leaf3, leaf4) // Check test files
        val expectedPairingRates = listOf((90 + 30 + 70) / 3, (90 + 60 + 70) / 3, (60 + 80 + 60) / 3)
        val expectedAvgCommits = listOf(30 + 10 + 30, 30 + 40 + 30, 20 + 30 + 40)
        leafs.forEachIndexed { i, curLeaf ->
            assertEquals(getAttributeValue(curLeaf.attributes, "pairingRate"), expectedPairingRates[i])
            assertEquals(getAttributeValue(curLeaf.attributes, "avgCommits"), expectedAvgCommits[i])
        }
    }

    @Test
    fun `given a set of attributeDescriptors it should be copied into the new project`() {
        val originalProject =
            ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE_3)!!)
            )
        val project = EdgeProjectBuilder(originalProject, '/').merge()
        val expectedDescriptors =
            mapOf(
                "Test" to
                    AttributeDescriptor(
                        description = "a",
                        hintLowValue = "b",
                        hintHighValue = "c",
                        link = "d",
                        direction = -1
                    ),
                "Test2" to
                    AttributeDescriptor(
                        title = "a1",
                        description = "b2",
                        hintLowValue = "c3",
                        hintHighValue = "d4",
                        link = "e5",
                        direction = -1
                    )
            )
        assertEquals(project.lenses.allAttributeDescriptors(), expectedDescriptors)
    }

    @Test
    fun `should preserve a node's contentHash and the opaque lenses through edge filtering`() {
        // given
        val leaf = Node("leaf.kt", NodeType.File, attributes = mapOf("rloc" to 1), checksum = "hash-abc")
        val root = Node("root", NodeType.Folder, children = setOf(leaf))
        val originalProject =
            Project(
                "p",
                nodes = listOf(root),
                apiVersion = "2.0",
                lenses = LensSet(opaqueLenses = mapOf("domain" to JsonParser.parseString("""{"layer":"backend"}""")))
            )

        // when
        val project = EdgeProjectBuilder(originalProject, '/').merge()

        // then
        val resultLeaf = getChildByName(project.rootNode.children.toMutableList(), "leaf.kt")
        assertEquals("hash-abc", resultLeaf.checksum)
        assertTrue(project.lenses.opaqueLenses.containsKey("domain"))
    }
}

private fun getChildByName(children: List<Node>, nodeName: String): Node {
    children.forEach {
        if (it.name == nodeName) return it
    }
    return Node(nodeName)
}

private fun getAttributeValue(attributes: Map<String, Any>, attributeName: String): Int =
    attributes.filterKeys { s: String -> s == attributeName }[attributeName].toString().toInt()
