package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.model.TreeCreator.createTree
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

@DisplayName("Tree Test")
class TreeTest {
@Nested
    @DisplayName("Tree Test > a tree of depth 0")
    inner class ZeroDepthTree {
    val tree = createTree()

        @Test
        fun `nodes should be only the tree itself`() {
            val nodes = tree.nodes
            assertThat(nodes.size).isEqualTo(1)
            assertThat(nodes.keys).contains(Path.TRIVIAL)
            assertThat(tree.asTreeNode()).isIn(nodes.values)
        }

        @Test
        fun `leaves should be only the tree itself`() {
            val leaves = tree.leaves
            assertThat(leaves.size).isEqualTo(1)
            assertThat(leaves.keys).contains(Path.TRIVIAL)
            assertThat(tree.asTreeNode()).isIn(leaves.values)
        }

        @Test
        fun `getNodeBy should return same tree on trivial path`() {
            assertThat(tree.getNodeBy(Path.TRIVIAL)).isEqualTo(tree)
        }

        @Test
        fun `getNodeBy should throw exception on path not contained in tree`() {
            assertFailsWith(NoSuchElementException::class) {
                tree.getNodeBy(Path("nonexistingpath"))
            }
        }
    }

    @Test
    fun `merging should do nothing by default`() {
        val tree = createTree()
        tree.merge(listOf(createTree().asTreeNode()))
        val leaves = tree.leaves

        assertThat(leaves).hasSize(1)
        assertThat(leaves.keys).contains(Path.TRIVIAL)
        assertThat(tree.asTreeNode()).isIn(leaves.values)
    }

    @Nested
    @DisplayName("Tree Test > a tree of depth 1")
    inner class OneDepthTree {
    val innerTree = createTree()
        val pathToInnerTree = Path("bla")
        val tree = createTree(pathToInnerTree, innerTree)

        @Test
        fun `nodes should contain exactly itself and the subtree`() {
            val nodes = tree.nodes
            assertThat(nodes).hasSize(2)
            assertThat(nodes.keys).contains(Path.TRIVIAL)
            assertThat(nodes.keys).contains(pathToInnerTree)
            assertThat(tree.asTreeNode()).isIn(nodes.values)
            assertThat(innerTree.asTreeNode()).isIn(nodes.values)
        }

        @Test
        fun `leaves should return the inner tree`() {
            val leaves = tree.leaves

            assertThat(leaves).hasSize(1)
            assertThat(leaves.keys).contains(pathToInnerTree)
            assertThat(innerTree.asTreeNode()).isIn(leaves.values)
        }

        @Test
        fun `getNodeBy should return same tree on trivial path`() {
            assertThat(tree.getNodeBy(Path.TRIVIAL)).isEqualTo(tree)
        }

        @Test
        fun `getNodeBy should return inner tree on pathToInnerTree`() {
            assertThat(tree.getNodeBy(pathToInnerTree)).isEqualTo(innerTree)
        }

        @Test
        fun `getNodeBy should throw exception on path not contained in tree`() {
            assertFailsWith(NoSuchElementException::class) {
                tree.getNodeBy(Path("nonexistingpath"))
            }
        }
    }
}
