package de.maibornwolff.codecharta.model

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class NodeMergerTest : Spek({
    describe("a node merger NodeMaxAttributeMerger") {
        context("merging nodes with same name") {
            val name = "Name"
            val type = NodeType.File
            val link = "node1"
            val attrib1 = mapOf("attrib11" to 1.0)
            val node1 = MutableNode(name, type, attrib1, link, nodeMergingStrategy = NodeMaxAttributeMerger())
            val node2 = MutableNode(name, type)
            val newNode = node1.merge(listOf(node2))

            it("should return merged node") {
                assertThat(newNode.name, `is`(name))
            }

            it("should prevail type") {
                assertThat(newNode.type, `is`(type))
            }

            it("should prevail link") {
                assertThat(newNode.link, `is`(link))
            }

            it("should merge attributes") {
                assertThat(newNode.attributes.count(), `is`(1))
                assertThat(newNode.attributes["attrib11"], `is`(1.0 as Any))
            }
        }

        context("merging nodes with children") {
            val child1 = MutableNode("child1", NodeType.File)
            val child2 = MutableNode("child2", NodeType.Folder)
            val child1_littleBitDifferent =
                MutableNode("child1", NodeType.File, mapOf(Pair("someAttribute", 1.0f)), "", setOf())
            val node1 = MutableNode(
                "Name", NodeType.File, mapOf(), "", setOf(child1_littleBitDifferent),
                nodeMergingStrategy = NodeMaxAttributeMerger()
            )
            val node2 = MutableNode("Name", NodeType.File, mapOf(), "", setOf(child1, child2))
            val newNode = node1.merge(listOf(node2))

            it("should NOT merge children") {
                assertThat(newNode.children, hasSize(0))
            }
        }
    }
})
