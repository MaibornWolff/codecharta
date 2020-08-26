package de.maibornwolff.codecharta.filter.edgefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.hamcrest.CoreMatchers
import org.hamcrest.MatcherAssert
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.InputStreamReader

class ProjectMergerTest : Spek({

    val TEST_EDGES_JSON_FILE = "coupling.json"
    val TEST_EDGES_JSON_FILE_2 = "coupling-empty-nodes.json"

    describe("filter edges as node attributes") {
        val originalProject = ProjectDeserializer.deserializeProject(
            InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE))
        )
        val project = EdgeProjectBuilder(originalProject, '/').merge()

        val parent1 = getChildByName(project.rootNode.children.toMutableList(), "Parent 1")
        val parent2 = getChildByName(parent1.children.toMutableList(), "Parent 2")

        val leaf1 = getChildByName(project.rootNode.children.toMutableList(), "leaf 1")
        val leaf3 = getChildByName(parent1.children.toMutableList(), "leaf 3")
        val leaf4 = getChildByName(parent2.children.toMutableList(), "leaf 4")

        it("should have correct amount of edges") {
            MatcherAssert.assertThat(project.sizeOfEdges(), CoreMatchers.`is`(6))
        }

        it("should have correct amount of files") {
            MatcherAssert.assertThat(project.size, CoreMatchers.`is`(5))
        }

        it("leaf1 should have correct number of attributes") {
            MatcherAssert.assertThat(leaf1.attributes.size, CoreMatchers.`is`(5))
        }

        it("leaf1 should have correct pairingRate_relative value") {
            val value: Int = getAttributeValue(leaf1.attributes, "pairingRate")
            val expectedValue = (90 + 30 + 70) / 3 // see testfile
            MatcherAssert.assertThat(value, CoreMatchers.`is`(expectedValue))
        }

        it("leaf1 should have correct avgCommits_absolute value") {
            val value: Int = getAttributeValue(leaf1.attributes, "avgCommits")
            val expectedValue = 30 + 10 + 30 // see testfile
            MatcherAssert.assertThat(value, CoreMatchers.`is`(expectedValue))
        }

        it("leaf3 should have correct pairingRate_relative value") {
            val number: Int = getAttributeValue(leaf3.attributes, "pairingRate")
            val expectedValue = (90 + 60 + 70) / 3 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf3 should have correct avgCommits_absolute value") {
            val number: Int = getAttributeValue(leaf3.attributes, "avgCommits")
            val expectedValue = 30 + 40 + 30 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf4 should have correct pairingRate_relative value") {
            val number: Int = getAttributeValue(leaf4.attributes, "pairingRate")
            val expectedValue = (60 + 80 + 60) / 3 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf4 should have correct avgCommits_absolute value") {
            val number: Int = getAttributeValue(leaf4.attributes, "avgCommits")
            val expectedValue = 20 + 30 + 40 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }
    }

    describe("filter edges as node attributes with empty nodes list in testfile") {
        val originalProject = ProjectDeserializer.deserializeProject(
            InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE_2))
        )
        val project = EdgeProjectBuilder(originalProject, '/').merge()

        val parent1 = getChildByName(project.rootNode.children.toMutableList(), "Parent 1")
        val parent2 = getChildByName(parent1.children.toMutableList(), "Parent 2")

        val leaf1 = getChildByName(project.rootNode.children.toMutableList(), "leaf 1")
        val leaf3 = getChildByName(parent1.children.toMutableList(), "leaf 3")
        val leaf4 = getChildByName(parent2.children.toMutableList(), "leaf 4")

        it("should have correct amount of edges") {
            MatcherAssert.assertThat(project.sizeOfEdges(), CoreMatchers.`is`(6))
        }

        it("leaf1 should have correct number of attributes") {
            MatcherAssert.assertThat(leaf1.attributes.size, CoreMatchers.`is`(2))
        }

        it("leaf1 should have correct pairingRate_relative value") {
            val value: Int = getAttributeValue(leaf1.attributes, "pairingRate")
            val expectedValue = (90 + 30 + 70) / 3 // see testfile
            MatcherAssert.assertThat(value, CoreMatchers.`is`(expectedValue))
        }

        it("leaf1 should have correct avgCommits_absolute value") {
            val value: Int = getAttributeValue(leaf1.attributes, "avgCommits")
            val expectedValue = 30 + 10 + 30 // see testfile
            MatcherAssert.assertThat(value, CoreMatchers.`is`(expectedValue))
        }

        it("leaf3 should have correct pairingRate_relative value") {
            val number: Int = getAttributeValue(leaf3.attributes, "pairingRate")
            val expectedValue = (90 + 60 + 70) / 3 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf3 should have correct avgCommits_absolute value") {
            val number: Int = getAttributeValue(leaf3.attributes, "avgCommits")
            val expectedValue = 30 + 40 + 30 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf4 should have correct pairingRate_relative value") {
            val number: Int = getAttributeValue(leaf4.attributes, "pairingRate")
            val expectedValue = (60 + 80 + 60) / 3 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf4 should have correct avgCommits_absolute value") {
            val number: Int = getAttributeValue(leaf4.attributes, "avgCommits")
            val expectedValue = 20 + 30 + 40 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }
    }
})

fun getChildByName(children: List<Node>, nodeName: String): Node {
    children.forEach {
        if (it.name == nodeName) return it
    }
    return Node(nodeName)
}

fun getAttributeValue(attributes: Map<String, Any>, attributeName: String): Int {
    return attributes.filterKeys { s: String -> s == attributeName }[attributeName].toString().toInt()
}
