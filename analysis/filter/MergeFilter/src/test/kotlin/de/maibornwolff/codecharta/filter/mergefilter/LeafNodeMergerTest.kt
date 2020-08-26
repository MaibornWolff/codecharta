package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class LeafNodeMergerTest : Spek({
    describe("a fitting merger") {
        val fittingMerger = LeafNodeMergerStrategy(false)

        context("merging nodes with same name") {
            val node1 = MutableNode("Name", NodeType.File)
            val node2 = MutableNode("Name", NodeType.Folder)

            val nodeList = fittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))

            it("should return merged node") {
                assertThat(nodeList, hasSize(1))
            }
        }

        context("merging nodes with children and with same name") {
            val child1 = MutableNode("child1", NodeType.File)
            val child2 = MutableNode("child2", NodeType.Folder)
            val child1_littleBitDifferent =
                MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
            val node1 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1_littleBitDifferent))
            val node2 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1, child2))

            val newNode = fittingMerger.mergeNodeLists(listOf(listOf(node2), listOf(node1)))[0]

            it("should merge children") {
                assertThat(newNode.children, hasSize(2))
                assertThat(newNode.children.toMutableList()[0].name, `is`(child1.name))
                assertThat(newNode.children.toMutableList()[0].type, `is`(child1.type))
                assertThat(newNode.children.toMutableList()[1].name, `is`(child2.name))
                assertThat(newNode.children.toMutableList()[1].type, `is`(child2.type))
            }

            it("should merge attributes") {
                assertThat(newNode.children.toMutableList()[0].attributes.size, `is`(1))
            }
        }

        context("merging nodes with children and with same name") {
            // given
            val childA = MutableNode("A", NodeType.File, mapOf("a" to 0))
            val childB = MutableNode("B", NodeType.Folder, mapOf(), "", setOf(MutableNode("A", NodeType.File)))
            val root1 = MutableNode("root", NodeType.Folder, mapOf(), "", setOf(childA, childB))

            val childA2 = MutableNode("A", NodeType.File)
            val childB2 = MutableNode("B", NodeType.Folder, mapOf(), "", setOf(MutableNode("A", NodeType.File)))
            val root2 = MutableNode("root", NodeType.Folder, mapOf(), "", setOf(childA2, childB2))

            // when
            val newRoot = fittingMerger.mergeNodeLists(listOf(listOf(root1), listOf(root2)))[0]

            it("should merge children") {
                assertThat(newRoot.children, hasSize(2))
                assertThat((newRoot.getNodeBy(Path(listOf("B", "A"))) as MutableNode).attributes.size, `is`(0))
            }
        }

        it("should merge leafs") {
            // given
            val child1_littleBitDifferent =
                MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
            val node1 = MutableNode("root", NodeType.File, mapOf(), "", setOf(child1_littleBitDifferent))
            val child1 = MutableNode("child1", NodeType.File)
            val intermediateNode = MutableNode("intermediateNode", NodeType.File, mapOf(), "", setOf(child1))
            val node2 = MutableNode("root", NodeType.File, mapOf(), "", setOf(intermediateNode))

            // when
            val newNode = fittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

            // then
            assertThat(newNode.children, hasSize(1))
            assertThat(newNode.children.toMutableList()[0].name, `is`(child1.name))
            assertThat(newNode.children.toMutableList()[0].type, `is`(child1.type))
        }

        context("merging empty nodes") {
            val nodeList = fittingMerger.mergeNodeLists(listOf())

            it("should return empty node list") {
                assertThat(nodeList, hasSize(0))
            }
        }

        context("merging single node list") {
            val nodeList = listOf(MutableNode("node", NodeType.File, mapOf()))
            val actualNodeList = fittingMerger.mergeNodeLists(listOf(nodeList))

            it("should return same node list") {
                assertThat(actualNodeList, `is`(nodeList))
            }
        }
    }

    describe("a misfitting merger") {
        val misfittingMerger = LeafNodeMergerStrategy(true)
        context("merging nodes with children and with same name") {
            val child1 = MutableNode("child1", NodeType.File)
            val child2 = MutableNode("child2", NodeType.Folder)
            val child1_littleBitDifferent =
                MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
            val node1 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1_littleBitDifferent))
            val node2 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1, child2))

            val newNode = misfittingMerger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))[0]

            it("should merge children") {
                assertThat(newNode.children, hasSize(2))
                assertThat(newNode.children.toMutableList()[0].name, `is`(child1.name))
                assertThat(newNode.children.toMutableList()[0].type, `is`(child1.type))
                assertThat(newNode.children.toMutableList()[1].name, `is`(child2.name))
                assertThat(newNode.children.toMutableList()[1].type, `is`(child2.type))
            }
        }
    }
})
