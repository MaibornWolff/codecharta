package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

class NodeTest {
@Test
    fun `getPathOfChild should only return valid children on root with one child`() {
        val childName = "child1"
        val child = MutableNode(childName)
        val root = MutableNode("root", NodeType.Folder, childrenList = listOf(child).toSet())

        val pathOfChild = root.getPathOfChild(child)

        assertThat(pathOfChild.isSingle).isTrue
        assertThat(pathOfChild.head).isEqualTo(childName)
        assertFailsWith(NoSuchElementException::class) {
            root.getPathOfChild(MutableNode("invalidChild"))
        }
    }

    @Test
    fun `pathsToLeafs should return path of child`() {
        val childName = "child1"
        val child = MutableNode(childName)
        val root = MutableNode("root", NodeType.Folder, childrenList = listOf(child).toSet())

        val pathsToLeafs = root.pathsToLeaves

        assertThat(pathsToLeafs).hasSize(1)
        assertThat(pathsToLeafs).contains((Path(childName)))
    }

    @Nested
    @DisplayName("NodeTest > with many children")
    inner class LeafNodeTest {
    val node11 = MutableNode("node11")
        val node12 = MutableNode("node12")
        val node1 = MutableNode("node1", NodeType.Folder, childrenList = listOf(node11, node12).toSet())
        val node21 = MutableNode("node21", NodeType.Folder)
        val node2 = MutableNode("node2", NodeType.Folder, childrenList = listOf(node21).toSet())
        val root = MutableNode("root", NodeType.Folder, childrenList = listOf(node1, node2).toSet())

        @Test
        fun `getLeafs should return leafs`() {
            val leafs = root.leafObjects

            assertThat(leafs).hasSize(3)
            assertThat(leafs).containsExactlyInAnyOrder(node11, node12, node21)
        }

        @Test
        fun `getPathsToLeafs should return paths of all leafs`() {
            val pathsToLeafs = root.pathsToLeaves

            assertThat(pathsToLeafs).hasSize(3)
            assertThat(pathsToLeafs).containsExactlyInAnyOrder(
                    Path("node1", "node11"),
                    Path("node1", "node12"),
                    Path("node2", "node21"),
                                                              )
        }
    }
}
