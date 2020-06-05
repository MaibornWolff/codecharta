package de.maibornwolff.codecharta.importer.crococosmo

import com.natpryce.hamkrest.assertion.assertThat
import com.natpryce.hamkrest.equalTo
import de.maibornwolff.codecharta.importer.crococosmo.model.* // ktlint-disable no-wildcard-imports
import org.junit.jupiter.api.Test

class CrococosmoConverterTest {
    private val converter = CrococosmoConverter()
    private val schema = Schema(listOf(SchemaVersion("1")))

    @Test
    fun convertedProjectShouldContainRootNode() {
        val g = Graph(schema, listOf())
        val project = converter.createProject(g)
        assertThat(project.rootNode.isLeaf, equalTo(true))
    }

    @Test
    fun convertedProjectShouldCollapseNodesWithoutName() {
        val nodeWithoutName = Node("", "type", listOf(), listOf())
        val g = Graph(schema, listOf(Node("node name", "type", listOf(nodeWithoutName), listOf())))
        val project = converter.createProject(g)
        val grantChildren = project.rootNode.children.toMutableList()[0].children

        assertThat(grantChildren.count(), equalTo(0))
    }

    @Test
    fun convertedProjectShouldNotCollapseNodesWithName() {
        val nodeWithName = Node("happyChild", "type", listOf(), listOf())
        val g = Graph(schema, listOf(Node("node name", "type", listOf(nodeWithName), listOf())))
        val project = converter.createProject(g)
        val grantChildren = project.rootNode.children.toMutableList()[0].children

        assertThat(grantChildren.count(), equalTo(1))
    }

    @Test
    fun convertedProjectShouldContainNode() {
        val nodeName = "node name"
        val g = Graph(schema, listOf(Node(nodeName, "type", listOf(), listOf())))
        val project = converter.createProject(g)
        val children = project.rootNode.children

        assertThat(children.filter({ nodeName == it.name }).count(), equalTo(1))
    }

    @Test
    fun convertedProjectShouldContainAttributes() {
        val attribName = "test"
        val attribValue = 1.22.toFloat()
        val versionId = "1"
        val v = Version(versionId, listOf(Attribute(attribName, "" + attribValue)))
        val e = Node("some node", "type", listOf(), listOf(v))
        val g = Graph(schema, listOf(e))
        val project = converter.createProject(g)
        var node = project.rootNode
        while (!node.children.isEmpty()) {
            node = node.children.first()
        }
        assertThat(node.attributes[attribName] == attribValue, equalTo(true))
    }

    @Test
    fun shouldConvertComplexGraph() {
        val `in` = this.javaClass.classLoader.getResourceAsStream("test.xml")
        val graph = CrococosmoDeserializer().deserializeCrococosmoXML(`in`)
        val project = converter.createProject(graph)

        assertThat(project.rootNode.leafObjects.count(), equalTo(17))
    }

    @Test
    fun shouldConvertGraphWithMultipleVersions() {
        val schemaWithMultipleVersions = Schema(listOf(SchemaVersion("1"), SchemaVersion("2")))
        val nodeWithoutName = Node("", "type", listOf(), listOf())
        val g = Graph(schemaWithMultipleVersions, listOf(Node("node name", "type", listOf(nodeWithoutName), listOf())))
        val projects = converter.convertToProjectsMap(g)

        assertThat(projects.size, equalTo(2))
    }
}
