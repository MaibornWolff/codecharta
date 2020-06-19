package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class RecursiveNodeMergerTest : Spek({
    describe("a recursive node merger") {
        val merger = RecursiveNodeMergerStrategy()

        context("merging nodes with same name") {
            val node1 = MutableNode("Name", NodeType.File)
            val node2 = MutableNode("Name", NodeType.Folder)

            val nodeList = merger.mergeNodeLists(listOf(listOf(node1), listOf(node2)))

            it("should return merged node") {
                assertThat(nodeList, hasSize(1))
            }
        }

        context("merging empty nodes") {
            val nodeList = merger.mergeNodeLists(listOf())

            it("should return empty node list") {
                assertThat(nodeList, hasSize(0))
            }
        }

        context("merging single node list") {
            val nodeList = listOf(MutableNode("node", NodeType.File, mapOf()))
            val actualNodeList = merger.mergeNodeLists(listOf(nodeList))

            it("should return same node list") {
                assertThat(actualNodeList, `is`(nodeList))
            }
        }

        context("merging nodes with children and with same name") {
            val child1 = MutableNode("child1", NodeType.File)
            val child2 = MutableNode("child2", NodeType.Folder)
            val child1_littleBitDifferent =
                    MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
            val node1 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1_littleBitDifferent))
            val node2 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1, child2))

            val newNode = merger.mergeNodeLists(listOf(listOf(node2), listOf(node1)))[0]

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

        context("merging node list with two root nodes") {
            // given
            val node11 = MutableNode("Name1", NodeType.File)
            val node12 = MutableNode("Name2", NodeType.File)
            val node2 = MutableNode("Name1", NodeType.Folder)

            // when
            val nodeList = merger.mergeNodeLists(listOf(listOf(node11, node12), listOf(node2)))

            it("should return two root nodes") {
                assertThat(nodeList, hasSize(2))
            }
        }
    }
})
