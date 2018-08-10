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

import com.google.gson.JsonParser
import org.hamcrest.BaseMatcher
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.MatcherAssert.assertThat
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.it
import java.io.File
import java.io.IOException
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class ProjectSerializerTest : Spek({
    val EXAMPLE_JSON_PATH = this.javaClass.classLoader.getResource("example.cc.json").file

    val tempDir = createTempDir()

    val filename = tempDir.absolutePath + "test.cc.json"


    fun matchesProjectFile(expectedProjectFile: File): Matcher<File> {
        return object : BaseMatcher<File>() {

            override fun describeTo(description: Description) {
                description.appendText("should be ").appendValue(expectedProjectFile.readLines())
            }

            override fun describeMismatch(item: Any, description: Description) {
                description.appendText("was").appendValue((item as File).readLines())
            }

            override fun matches(item: Any): Boolean {
                return fileContentEqual(item as File, expectedProjectFile)
            }

            private fun fileContentEqual(actual: File, expected: File): Boolean {
                val parser = JsonParser()
                val actualJson = parser.parse(actual.reader())
                val expectedJson = parser.parse(expected.reader())
                return actualJson == expectedJson
            }
        }
    }

    it("should serialize project") {
        val testProject = ProjectDeserializer.deserializeProject(EXAMPLE_JSON_PATH)

        ProjectSerializer.serializeProjectAndWriteToFile(testProject, filename)

        val result = File(filename)
        assertTrue(result.exists())
        assertThat(result, matchesProjectFile(File(EXAMPLE_JSON_PATH)))
    }

    it("serialize with wrong path throws exception") {
        val testProject = ProjectDeserializer.deserializeProject(EXAMPLE_JSON_PATH)

        assertFailsWith(IOException::class) {
            ProjectSerializer.serializeProjectAndWriteToFile(testProject, tempDir.absolutePath + "/someverystupidpath/out.json")
        }
    }

})
