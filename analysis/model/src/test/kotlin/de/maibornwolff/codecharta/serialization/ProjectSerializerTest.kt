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
import junit.framework.TestCase.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File
import java.io.FileReader
import java.io.IOException

class ProjectSerializerTest {
    @JvmField
    @Rule
    var folder = TemporaryFolder()

    private val filename: String
        get() {
            val tmpFolder = folder.root.absolutePath
            return tmpFolder + "test.cc.json"
        }

    @Throws(IOException::class)
    private fun fileContentEqual(actual: File, expected: File): Boolean {
        val parser = JsonParser()
        val actualJson = parser.parse(FileReader(actual))
        val expectedJson = parser.parse(FileReader(expected))
        return actualJson == expectedJson
    }

    @Test
    @Throws(IOException::class)
    fun shouldSerializeProject() {
        val testProject = ProjectDeserializer.deserializeProject(EXAMPLE_JSON_PATH)

        ProjectSerializer.serializeProjectAndWriteToFile(testProject, filename)

        val result = File(filename)
        assertTrue(result.exists())
        assertTrue(fileContentEqual(result, File(EXAMPLE_JSON_PATH)))
    }

    @Test(expected = IOException::class)
    @Throws(IOException::class)
    fun serializeWithWrongPathThrowsException() {
        val testProject = ProjectDeserializer.deserializeProject(EXAMPLE_JSON_PATH)

        ProjectSerializer.serializeProjectAndWriteToFile(testProject, folder.root.absolutePath + "/someverystupidpath/out.json")

        val result = File(filename)
        assertTrue(result.exists())
        assertTrue(fileContentEqual(result, File(EXAMPLE_JSON_PATH)))
    }

    companion object {

        private const val EXAMPLE_JSON_PATH = "./src/test/resources/example.cc.json"
    }
}
