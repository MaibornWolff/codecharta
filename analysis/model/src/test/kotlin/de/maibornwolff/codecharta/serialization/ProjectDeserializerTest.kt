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

import junit.framework.TestCase.assertTrue
import org.hamcrest.Matchers.*
import org.junit.Assert.assertThat
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.FileNotFoundException
import java.io.InputStreamReader
import java.io.StringReader

class ProjectDeserializerTest {
    @JvmField
    @Rule
    var folder = TemporaryFolder()

    @Test
    @Throws(FileNotFoundException::class)
    fun shouldDeserializeProjectJson() {
        val expectedJsonReader = InputStreamReader(this.javaClass.classLoader.getResourceAsStream(EXAMPLE_CC_JSON))

        val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

        assertTrue(project.projectName == "201701poolobject")
        assertTrue(project.nodes.size == 1)
    }

    @Test
    @Throws(FileNotFoundException::class)
    fun deserializeProject_should_map_nonexisting_values_to_defaults() {
        // given
        val jsonString = "{projectName='some Project', apiVersion='1.0', nodes=[{name:'root',type:'Folder'}]}"

        // when
        val project = ProjectDeserializer.deserializeProject(StringReader(jsonString))

        // then
        val node = project.nodes[0]

        assertThat(node.link, `is`(nullValue()))
        assertThat(node.attributes, not(nullValue()))
        assertThat(node.children, not(nullValue()))
    }

    companion object {

        private const val EXAMPLE_CC_JSON = "example.cc.json"
    }
}
