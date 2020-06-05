package de.maibornwolff.codecharta.model

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.hasItem
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.util.* // ktlint-disable no-wildcard-imports
import kotlin.test.assertFailsWith

class NodeTest : Spek({
    describe("root with child") {
        val childName = "child1"
        val child = MutableNode(childName)
        val root = MutableNode("root", NodeType.Folder, childrenList = Arrays.asList(child).toSet())

        context("getPathOfChild of valid child") {
            val pathOfChild = root.getPathOfChild(child)

            it("should return path") {
                assertThat(pathOfChild.isSingle, `is`(true))
                assertThat(pathOfChild.head, `is`(childName))
            }
        }

        context("getPathOfChild of invalid child") {
            it("should throw an exception") {
                assertFailsWith(NoSuchElementException::class) {
                    root.getPathOfChild(MutableNode("invalidChild"))
                }
            }
        }

        it("pathsToLeafs should return path of child") {
            val pathsToLeafs = root.pathsToLeaves

            assertThat(pathsToLeafs, hasSize(1))
            assertThat(pathsToLeafs, PathMatcher.containsPath(Path(childName)))
        }
    }

    describe("root node with many children") {
        val node11 = MutableNode("node11")
        val node12 = MutableNode("node12")
        val node1 = MutableNode("node1", NodeType.Folder, childrenList = Arrays.asList(node11, node12).toSet())
        val node21 = MutableNode("node21", NodeType.Folder)
        val node2 = MutableNode("node2", NodeType.Folder, childrenList = Arrays.asList(node21).toSet())
        val root = MutableNode("root", NodeType.Folder, childrenList = Arrays.asList(node1, node2).toSet())

        it("getLeafs should return leafs") {
            val leafs = root.leafObjects

            assertThat(leafs, hasSize(3))
            assertThat(leafs, hasItem(node11))
            assertThat(leafs, hasItem(node12))
            assertThat(leafs, hasItem(node21))
        }

        it("getPathsToLeafs should return paths of all leafs") {
            val pathsToLeafs = root.pathsToLeaves

            assertThat(pathsToLeafs, hasSize(3))
            assertThat(pathsToLeafs, PathMatcher.containsPath(Path("node1", "node11")))
            assertThat(pathsToLeafs, PathMatcher.containsPath(Path("node1", "node12")))
            assertThat(pathsToLeafs, PathMatcher.containsPath(Path("node2", "node21")))
        }
    }
})