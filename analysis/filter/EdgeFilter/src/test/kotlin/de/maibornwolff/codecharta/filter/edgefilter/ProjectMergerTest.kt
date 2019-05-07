/*
 * Copyright (c) 2018, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.filter.edgefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.hamcrest.CoreMatchers
import org.hamcrest.MatcherAssert
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.InputStreamReader

class ProjectMergerTest: Spek({

    val TEST_EDGES_JSON_FILE = "coupling.json"
    val TEST_EDGES_JSON_FILE_2 = "coupling-empty-nodes.json"


    describe("filter edges as node attributes") {
        val originalProject = ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE)))
        val project = EdgeProjectBuilder(originalProject, '/').merge()

        val parent1 = getChildByName(project.rootNode.children, "Parent 1")
        val parent2 = getChildByName(parent1.children, "Parent 2")

        val leaf1 = getChildByName(project.rootNode.children, "leaf 1")
        val leaf3 = getChildByName(parent1.children, "leaf 3")
        val leaf4 = getChildByName(parent2.children, "leaf 4")

        it("should have correct amount of edges") {
            MatcherAssert.assertThat(project.sizeOfEdges(), CoreMatchers.`is`(6))
        }

        it("should have correct amount of files") {
            MatcherAssert.assertThat(project.size, CoreMatchers.`is`(5))
        }

        it("leaf1 should have correct number of attributes") {
            MatcherAssert.assertThat(leaf1.attributes.size, CoreMatchers.`is`(5))
        }

        it("leaf1 should have correct pairingRate_relative value") {
            val value: Int = getAttributeValue(leaf1.attributes, "pairingRate_relative")
            val expectedValue = (90 + 30 + 70) / 3 // see testfile
            MatcherAssert.assertThat(value, CoreMatchers.`is`(expectedValue))
        }

        it("leaf1 should have correct avgCommits_absolute value") {
            val value: Int = getAttributeValue(leaf1.attributes, "avgCommits_absolute")
            val expectedValue = 30 + 10 + 30 // see testfile
            MatcherAssert.assertThat(value, CoreMatchers.`is`(expectedValue))
        }

        it("leaf3 should have correct pairingRate_relative value") {
            val number: Int = getAttributeValue(leaf3.attributes, "pairingRate_relative")
            val expectedValue = (90 + 60 + 70) / 3 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf3 should have correct avgCommits_absolute value") {
            val number: Int = getAttributeValue(leaf3.attributes, "avgCommits_absolute")
            val expectedValue = 30 + 40 + 30 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf4 should have correct pairingRate_relative value") {
            val number: Int = getAttributeValue(leaf4.attributes, "pairingRate_relative")
            val expectedValue = (60 + 80 + 60) / 3 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf4 should have correct avgCommits_absolute value") {
            val number: Int = getAttributeValue(leaf4.attributes, "avgCommits_absolute")
            val expectedValue = 20 + 30 + 40 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }
    }


    describe("filter edges as node attributes with empty nodes list in testfile") {
        val originalProject = ProjectDeserializer.deserializeProject(
                InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE_2)))
        val project = EdgeProjectBuilder(originalProject, '/').merge()

        val parent1 = getChildByName(project.rootNode.children, "Parent 1")
        val parent2 = getChildByName(parent1.children, "Parent 2")

        val leaf1 = getChildByName(project.rootNode.children, "leaf 1")
        val leaf3 = getChildByName(parent1.children, "leaf 3")
        val leaf4 = getChildByName(parent2.children, "leaf 4")


        it("should have correct amount of edges") {
            MatcherAssert.assertThat(project.sizeOfEdges(), CoreMatchers.`is`(6))
        }

        it("leaf1 should have correct number of attributes") {
            MatcherAssert.assertThat(leaf1.attributes.size, CoreMatchers.`is`(2))
        }

        it("leaf1 should have correct pairingRate_relative value") {
            val value: Int = getAttributeValue(leaf1.attributes, "pairingRate_relative")
            val expectedValue = (90 + 30 + 70) / 3 // see testfile
            MatcherAssert.assertThat(value, CoreMatchers.`is`(expectedValue))
        }

        it("leaf1 should have correct avgCommits_absolute value") {
            val value: Int = getAttributeValue(leaf1.attributes, "avgCommits_absolute")
            val expectedValue = 30 + 10 + 30 // see testfile
            MatcherAssert.assertThat(value, CoreMatchers.`is`(expectedValue))
        }

        it("leaf3 should have correct pairingRate_relative value") {
            val number: Int = getAttributeValue(leaf3.attributes, "pairingRate_relative")
            val expectedValue = (90 + 60 + 70) / 3 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf3 should have correct avgCommits_absolute value") {
            val number: Int = getAttributeValue(leaf3.attributes, "avgCommits_absolute")
            val expectedValue = 30 + 40 + 30 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf4 should have correct pairingRate_relative value") {
            val number: Int = getAttributeValue(leaf4.attributes, "pairingRate_relative")
            val expectedValue = (60 + 80 + 60) / 3 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }

        it("leaf4 should have correct avgCommits_absolute value") {
            val number: Int = getAttributeValue(leaf4.attributes, "avgCommits_absolute")
            val expectedValue = 20 + 30 + 40 // see testfile
            MatcherAssert.assertThat(number, CoreMatchers.`is`(expectedValue))
        }
    }
})

fun getChildByName(children: List<Node>, nodeName: String): Node {
    children.forEach {
        if (it.name == nodeName) return it
    }
    return Node(nodeName)
}

fun getAttributeValue(attributes: Map<String, Any>, attributeName: String): Int {
    return attributes.filterKeys { s: String -> s == attributeName }[attributeName].toString().toInt()
}
