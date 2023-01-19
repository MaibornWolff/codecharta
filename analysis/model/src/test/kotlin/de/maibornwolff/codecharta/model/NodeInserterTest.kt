package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class NodeInserterTest {

    @Test
    fun `root insert should put a node as leaf`() {
        val root = MutableNode("root", NodeType.Folder)
        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
        NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)

        assertThat(root.children).hasSize(1)
        assertThat(root.pathsToLeaves).hasSize(1)
        assertThat(root.getNodeBy(Path("insertedNode"))).isEqualTo(nodeForInsertion)
    }

    @Test
    fun `double root insert should only put the first insertion as leaf`() {
        val root = MutableNode("root", NodeType.Folder)
        val nodeForInsertion = MutableNode("insertedNode", NodeType.File, link = null)
        val secondNodeForInsertion = MutableNode("insertedNode", NodeType.Folder)

        NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)
        NodeInserter.insertByPath(root, Path.trivialPath(), secondNodeForInsertion)

        assertThat(root.children).hasSize(1)
        assertThat(root.pathsToLeaves).hasSize(1)
        assertThat(root.getNodeBy(Path("insertedNode")).toString()).isEqualTo(nodeForInsertion.toString())
    }

    @Test
    fun `inserting node where an intermediate node is present should insert it as leaf`() {
        val root = MutableNode("root", NodeType.Folder)
        val intermediateNode = MutableNode("folder", NodeType.Folder)
        root.children.add(intermediateNode)

        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
        NodeInserter.insertByPath(root, Path("folder"), nodeForInsertion)

        assertThat(root.children).hasSize(1)
        assertThat(root.children).contains(intermediateNode)
        assertThat(root.pathsToLeaves).hasSize(1)
        assertThat(root.getNodeBy(Path("folder", "insertedNode"))).isEqualTo(nodeForInsertion)
    }

    @Test
    fun `inserting node without an intermediate should create an additional phantom folder node`() {
        val root = MutableNode("root", NodeType.Folder)
        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
        val position = Path("folder")

        NodeInserter.insertByPath(root, position, nodeForInsertion)

        assertThat(root.children).hasSize(1)
        val createdPhantomNode = root.children.toMutableList()[0]
        assertThat(createdPhantomNode.name).isEqualTo("folder")
    }

    @Test
    fun `inserting node in end position should insert node as leaf`() {
        val root = MutableNode("root", NodeType.Folder)
        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)

        NodeInserter.insertByPath(root, Path("folder", "subfolder"), nodeForInsertion)

        assertThat(root.children).hasSize(1)
        assertThat(root.pathsToLeaves).hasSize(1)
        assertThat(root.getNodeBy(Path("folder", "subfolder", "insertedNode"))).isEqualTo(nodeForInsertion)
    }

    @Test
    fun `inserting node in end position without endings slash should insert node as leaf`() {
        val root = MutableNode("root", NodeType.Folder)
        val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
        val path = Path("folder", "subfolder")

        NodeInserter.insertByPath(root, path, nodeForInsertion)

        assertThat(root.children).hasSize(1)
        assertThat(root.pathsToLeaves).hasSize(1)
        assertThat(root.getNodeBy(Path("folder", "subfolder", "insertedNode"))).isEqualTo(nodeForInsertion)
    }
}
