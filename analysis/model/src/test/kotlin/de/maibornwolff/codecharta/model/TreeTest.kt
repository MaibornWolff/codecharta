package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.model.TreeCreator.createTree
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasItem
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.util.*
import kotlin.test.assertFailsWith

class TreeTest : Spek({
    describe("a tree of depth 0") {
        val tree = createTree()

        it("nodes should be only the tree itself") {
            val nodes = tree.nodes
            assertThat(nodes.size, `is`(1))
            assertThat(nodes.keys, hasItem(Path.TRIVIAL))
            assertThat(nodes.values, hasItem(tree))
        }

        it("leaves should be only the tree itself") {
            val leaves = tree.leaves
            assertThat(leaves.size, `is`(1))
            assertThat(leaves.keys, hasItem(Path.TRIVIAL))
            assertThat(leaves.values, hasItem(tree))
        }

        it("getNodeBy should return same tree on trivial path") {
            assertThat(tree.getNodeBy(Path.TRIVIAL), `is`(tree))
        }

        it("getNodeBy should throw exception on path not contained in tree") {
            assertFailsWith(NoSuchElementException::class) {
                tree.getNodeBy(Path("nonexistingpath"))
            }
        }

        context("when merging") {
            tree.merge(listOf(createTree().asTreeNode()))

            it("should do nothing by default") {
                val leaves = tree.leaves

                assertThat(leaves.size, `is`(1))
                assertThat(leaves.keys, hasItem(Path.TRIVIAL))
                assertThat(leaves.values, hasItem(tree))
            }
        }
    }

    describe("a tree of depth 1") {
        val innerTree = createTree()
        val pathToInnerTree = Path("bla")
        val tree = createTree(pathToInnerTree, innerTree)

        it("nodes should contain exactly itself and the subtree") {
            val nodes = tree.nodes

            assertThat(nodes.size, `is`(2))
            assertThat(nodes.keys, hasItem(Path.TRIVIAL))
            assertThat(nodes.keys, hasItem(pathToInnerTree))
            assertThat(nodes.values, hasItem(tree))
            assertThat(nodes.values, hasItem(innerTree))
        }

        it("leaves should return the inner tree") {
            val leaves = tree.leaves

            assertThat(leaves.size, `is`(1))
            assertThat(leaves.keys, hasItem(pathToInnerTree))
            assertThat(leaves.values, hasItem(innerTree))
        }

        it("getNodeBy should return same tree on trivial path") {
            assertThat(tree.getNodeBy(Path.TRIVIAL), `is`(tree))
        }

        it("getNodeBy should return inner tree on pathToInnerTree") {
            assertThat(tree.getNodeBy(pathToInnerTree), `is`(innerTree))
        }

        it("getNodeBy should throw exception on path not contained in tree") {
            assertFailsWith(NoSuchElementException::class) {
                tree.getNodeBy(Path("nonexistingpath"))
            }
        }
    }
})