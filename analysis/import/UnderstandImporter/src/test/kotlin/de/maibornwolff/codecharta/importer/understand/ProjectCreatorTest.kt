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

package de.maibornwolff.codecharta.importer.understand

import de.maibornwolff.codecharta.translator.MetricNameTranslator
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.*
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import org.jetbrains.spek.api.dsl.on
import java.io.ByteArrayInputStream
import java.io.InputStream
import java.nio.charset.StandardCharsets

class ProjectCreatorTest : Spek({
    fun toInputStream(content: String): InputStream {
        return ByteArrayInputStream(content.toByteArray(StandardCharsets.UTF_8))
    }

    describe("a ProjectCreator") {
        val projectCreator = ProjectCreator("test", '\\', ',')

        on("adding invalid csv") {

            val invalidContent = "head,path\nnoValidContent\n"
            val project = projectCreator.createFromCsvStream(toInputStream(invalidContent))

            it("should be ignored") {
                assertThat(project.rootNode.children, hasSize(0))
            }
        }

        on("adding valid csv") {
            val name = "someName"
            val project = projectCreator.createFromCsvStream(
                    toInputStream("someContent,,path\nprojectName,blubb2,$name")
            )

            it("should have node with same name") {
                assertThat(project.rootNode.children.map { it.name }, hasItem(name))
            }
        }

        on("adding same line twice") {
            val name = "someNameOrOther"
            val project = projectCreator.createFromCsvStream(
                    listOf(
                            toInputStream("someContent\n$name"),
                            toInputStream("someContent\n$name")
                    )
            )

            it("should add only first line") {
                assertThat(project.rootNode.children.filter { it.name == name }.size, `is`(1))
            }
        }
    }

    describe("a ProjectCreator") {
        val projectCreator = ProjectCreator("test", '\\', ',')

        on("adding line with metric values") {
            val attribName = "attname"
            val attribVal = "\"0,1\""
            val attValFloat = 0.1f

            val project = projectCreator.createFromCsvStream(
                    toInputStream("head1,path,head3,head4,$attribName\nprojectName,\"9900,01\",\"blubb\",1.0,$attribVal\n")
            )

            it("should add attributes to node") {
                val nodeAttributes = project.rootNode.children.iterator().next().attributes
                assertThat(nodeAttributes.size, `is`(3))
                assertThat<Any>(nodeAttributes[attribName], `is`<Any>(attValFloat))
            }
        }

    }

    describe("a ProjectCreator") {
        val projectCreator = ProjectCreator("test", '\\', ',')

        on("adding file with subdirectory") {
            val directoryName = "someNodeName"
            val project = projectCreator.createFromCsvStream(toInputStream("someContent\n$directoryName\\someFile"))

            it("should create node for subdirectory") {
                assertThat(project.rootNode.children.size, `is`(1))
                val node = project.rootNode.children.iterator().next()
                assertThat(node.name, `is`(directoryName))
                assertThat(node.children.size, `is`(1))
            }
        }
    }

    describe("ProjectCreator for Understand") {
        val projectCreator = ProjectCreator("test", '\\', ',',
                MetricNameTranslator(mapOf(Pair("File", "path"))),
                { it[0] == "File" || it[0] == "Class" }
        )


        on("reading csv lines from Understand") {
            val project = projectCreator.createFromCsvStream(this.javaClass.classLoader.getResourceAsStream("understand.csv"))

            it("has correct number of nodes") {
                assertThat(project.rootNode.nodes.size, greaterThan(1))
                assertThat(project.rootNode.leafObjects.size, `is`(223))
            }

            it("leaf has file attributes") {
                val attributes = project.rootNode.leafObjects.flatMap { it.attributes.keys }.distinct()
                assertThat(attributes, hasItem("countline"))
            }

            it("leaf has class attributes") {
                val attributes = project.rootNode.leafObjects.flatMap { it.attributes.keys }.distinct()
                assertThat(attributes, hasItem("countclasscoupled"))
            }
        }
    }
})