package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.model.NodeMatcher.hasNodeAtPath
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasItem
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class NodeInserterTest : Spek({

    describe("NodeInserter") {
        context("Inserting a node at root") {
            val root = MutableNode("root", NodeType.Folder)
            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)

            it("should insert node in leaf position") {
                assertThat(root.children, hasSize(1))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("insertedNode")))
            }
        }

        context("Inserting a node at root twice") {
            val root = MutableNode("root", NodeType.Folder)

            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            val secondNodeForInsertion = MutableNode("insertedNode", NodeType.Folder)
            NodeInserter.insertByPath(root, Path.trivialPath(), nodeForInsertion)

            NodeInserter.insertByPath(root, Path.trivialPath(), secondNodeForInsertion)

            it("should  insert node in leaf position only once") {
                assertThat(root.children, hasSize(1))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("insertedNode")))
            }
        }

        context("Inserting a node with intermediate position already present") {
            val root = MutableNode("root", NodeType.Folder)
            val intermediateNode = MutableNode("folder", NodeType.Folder)
            root.children.add(intermediateNode)

            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            NodeInserter.insertByPath(root, Path("folder"), nodeForInsertion)

            it("should insert node in leaf position") {
                assertThat(root.children, hasSize(1))
                assertThat(root.children, hasItem(intermediateNode))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(root.toNode(), hasNodeAtPath(nodeForInsertion.toNode(), Path("folder", "insertedNode")))
            }
        }

        context("Inserting a node without intermediate position already present") {
            val root = MutableNode("root", NodeType.Folder)
            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            val position = Path("folder")
            NodeInserter.insertByPath(root, position, nodeForInsertion)

            it("should insert phantom node in inner position") {
                assertThat(root.children, hasSize(1))
                val createdPhantomNode = root.children.toMutableList()[0]
                assertThat(createdPhantomNode.name, `is`("folder"))
            }
        }

        context("Inserting node in end position") {
            val root = MutableNode("root", NodeType.Folder)
            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            NodeInserter.insertByPath(root, Path("folder", "subfolder"), nodeForInsertion)

            it("should insert node in leaf position") {
                assertThat(root.children, hasSize(1))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(
                    root.toNode(),
                    hasNodeAtPath(nodeForInsertion.toNode(), Path("folder", "subfolder", "insertedNode"))
                )
            }
        }

        context("Inserting node in end position without ending slash") {
            val root = MutableNode("root", NodeType.Folder)
            val nodeForInsertion = MutableNode("insertedNode", NodeType.File)
            val path = Path("folder", "subfolder")
            NodeInserter.insertByPath(root, path, nodeForInsertion)

            it("should insert node in leaf position") {
                assertThat(root.children, hasSize(1))
                assertThat(root.pathsToLeaves.count(), `is`(1))
                assertThat(
                    root.toNode(),
                    hasNodeAtPath(nodeForInsertion.toNode(), Path("folder", "subfolder", "insertedNode"))
                )
            }
        }
    }
})
