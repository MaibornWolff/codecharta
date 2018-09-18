/*
 * Copyright (c) 2017, MaibornWolff GmbH
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

package de.maibornwolff.codecharta.serialization

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.*
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.it
import java.io.StringReader

class ProjectDeserializerTest : Spek({
    val EXAMPLE_CC_JSON = "example.cc.json"

    it("shouldDeserializeProjectJson") {
        val expectedJsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_CC_JSON).reader()

        val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

        assertThat(project.projectName, `is`("201701poolobject"))
        assertThat(project.size, `is`(6))
    }

    it("deserializeProject_should_map_nonexisting_values_to_defaults") {
        // given
        val jsonString = "{projectName='some Project', apiVersion='1.0', nodes=[{name:'root',type:'Folder'}]}"

        // when
        val project = ProjectDeserializer.deserializeProject(StringReader(jsonString))

        // then
        val node = project.rootNode

        assertThat(node.link, nullValue())
        assertThat(node.attributes, not(nullValue()))
        assertThat(node.children, not(nullValue()))
    }
})
