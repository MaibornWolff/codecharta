package de.maibornwolff.codecharta.analysers.filters.edgefilter

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.junit.jupiter.api.Assertions.assertEquals
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
                        description = "a", hintLowValue = "b", hintHighValue = "c",
                        link = "d", direction = -1
                    ),
                "Test2" to
                    AttributeDescriptor(
                        title = "a1", description = "b2", hintLowValue = "c3",
                        hintHighValue = "d4", link = "e5", direction = -1
                    )
            )
        assertEquals(project.attributeDescriptors, expectedDescriptors)
    }
}

private fun getChildByName(children: List<Node>, nodeName: String): Node {
    children.forEach {
        if (it.name == nodeName) return it
    }
    return Node(nodeName)
}

private fun getAttributeValue(attributes: Map<String, Any>, attributeName: String): Int {
    return attributes.filterKeys { s: String -> s == attributeName }[attributeName].toString().toInt()
}
