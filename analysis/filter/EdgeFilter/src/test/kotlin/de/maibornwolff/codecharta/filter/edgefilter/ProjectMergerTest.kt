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

import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.hamcrest.CoreMatchers
import org.hamcrest.MatcherAssert
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import java.io.InputStreamReader
import kotlin.test.assertFailsWith

class ProjectMergerTest : Spek({

    val TEST_EDGES_JSON_FILE = "coupling.json"

    describe("filter edges as node attributes") {
        val originalProject = ProjectDeserializer.deserializeProject(InputStreamReader(this.javaClass.classLoader.getResourceAsStream(TEST_EDGES_JSON_FILE)))


        println("_A1")
        println(originalProject)
        println(originalProject.rootNode.children[0].name)
        println(originalProject.rootNode.children[0].attributes)
        println("_A2")

        val project = ProjectMerger(originalProject).merge()

        println("_B1")
        println(project)
        println(project.rootNode.children[0].name)
        println(project.rootNode.children[0].attributes)
        println("_B2")

        it("should have correct number of dependencies") {
            MatcherAssert.assertThat(project.sizeOfEdges(), CoreMatchers.`is`(3))
        }

        it("should have correct number of files") {
            MatcherAssert.assertThat(project.size, CoreMatchers.`is`(5))
        }

        it("should have correct number of attributes") {
            MatcherAssert.assertThat(project.rootNode.children.first().attributes.size, CoreMatchers.`is`(5))

        }
    }
})
