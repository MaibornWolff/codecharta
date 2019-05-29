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

package de.maibornwolff.codecharta.importer.crococosmo

import com.natpryce.hamkrest.assertion.assertThat
import com.natpryce.hamkrest.equalTo
import de.maibornwolff.codecharta.importer.crococosmo.model.*
import org.junit.jupiter.api.Test

class CrococosmoConverterTest {

    private val converter = CrococosmoConverter()

    private val schema = Schema(listOf(SchemaVersion("1")))

    @Test
    fun convertedProjectShouldContainRootNode() {
        val g = Graph(schema, listOf())
        val project = converter.createProject("sample Project", g)
        assertThat(project.rootNode.isLeaf, equalTo(true))
    }

    @Test
    fun convertedProjectShouldCollapseNodesWithoutName() {
        val nodeWithoutName = Node("", "type", listOf(), listOf())
        val g = Graph(schema, listOf(Node("node name", "type", listOf(nodeWithoutName), listOf())))
        val project = converter.createProject("sample Project", g)
        val grantChildren = project.rootNode.children[0].children

        assertThat(grantChildren.count(), equalTo(0))
    }

    @Test
    fun convertedProjectShouldNotCollapseNodesWithName() {
        val nodeWithName = Node("happyChild", "type", listOf(), listOf())
        val g = Graph(schema, listOf(Node("node name", "type", listOf(nodeWithName), listOf())))
        val project = converter.createProject("sample Project", g)
        val grantChildren = project.rootNode.children[0].children

        assertThat(grantChildren.count(), equalTo(1))
    }

    @Test
    fun convertedProjectShouldContainNode() {
        val nodeName = "node name"
        val g = Graph(schema, listOf(Node(nodeName, "type", listOf(), listOf())))
        val project = converter.createProject("sample Project", g)
        val children = project.rootNode.children

        assertThat(children.filter({ nodeName == it.name }).count(), equalTo(1))
    }

    @Test
    fun convertedProjectShouldContainAttributes() {
        val attribName = "test"
        val attribValue = 1.22.toFloat()
        val versionId = "1"
        val v = Version(versionId, listOf(Attribute(attribName, "" + attribValue)))
        val e = Node("some node", "type", listOf(), listOf(v))
        val g = Graph(schema, listOf(e))

        val project = converter.createProject("sample Project", g)

        var node = project.rootNode
        while (!node.children.isEmpty()) {
            node = node.children.first()
        }
        assertThat(node.attributes[attribName] == attribValue, equalTo(true))
    }

    @Test
    fun shouldConvertComplexGraph() {

        val `in` = this.javaClass.classLoader.getResourceAsStream("test.xml")
        val graph = CrococosmoDeserializer().deserializeCrococosmoXML(`in`)
        val project = converter.createProject("test", graph)

        assertThat(project.rootNode.leafObjects.count(), equalTo(17))
    }

    @Test
    fun shouldConvertGraphWithMultipleVersions() {
        val schemaWithMultipleVersions = Schema(listOf(SchemaVersion("1"), SchemaVersion("2")))
        val nodeWithoutName = Node("", "type", listOf(), listOf())
        val g = Graph(schemaWithMultipleVersions, listOf(Node("node name", "type", listOf(nodeWithoutName), listOf())))
        val projects = converter.convertToProjectsMap("sample Project", g)

        assertThat(projects.size, equalTo(2))
    }
}
