package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ProjectBuilderTest {

    @Test
    fun `without root inserting a new node should insert as child of root`() {
        val projectBuilder = ProjectBuilder()
        val nodeForInsertion = MutableNode("someNode", NodeType.File)
        projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

        val root = projectBuilder.build().rootNode
        assertThat(root.children).hasSize(1)
        assertThat(root.children.toMutableList()[0].toString()).isEqualTo(nodeForInsertion.toNode().toString())
    }

    @Test
    fun `with root inserting a new node should create project with root`() {
        val root = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder(listOf(root))

        val nodeForInsertion = MutableNode("someNode", NodeType.File)
        projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

        val project = projectBuilder.build()
        assertThat(project.rootNode.toString()).isEqualTo(root.toNode().toString())
        assertThat(root.children).hasSize(1)
        assertThat(root.children.toMutableList()[0]).isEqualTo(nodeForInsertion)
    }

    @Test
    fun `building with empty folders should filter them`() {
        val projectBuilder = ProjectBuilder()
        val nodeForInsertion = MutableNode("someNode", NodeType.Folder)
        projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

        val project = projectBuilder.build()

        val root = project.rootNode
        assertThat(root.children).hasSize(0)
    }
}
