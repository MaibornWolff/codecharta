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

import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Project
import java.io.BufferedReader
import java.io.FileNotFoundException
import java.io.FileReader
import java.io.Reader

/**
 * This class provides static methods and functions to convert a json to a Project-Object
 */
object ProjectDeserializer {

    private val GSON = GsonBuilder()
            .registerTypeAdapter(Node::class.java, NodeJsonDeserializer())
            .registerTypeAdapter(Project::class.java, ProjectJsonDeserializer())
            .create()

    /**
     * This function deserializes a given json-file and returns the Project-Object it represents.
     *
     * @param pathToJson the path to the Json-File
     * @return the project, if the Json was parsed successfully, null if not
     */
    @Throws(FileNotFoundException::class)
    fun deserializeProject(pathToJson: String): Project {
        return deserializeProject(BufferedReader(FileReader(pathToJson)))
    }

    /**
     * This function deserializes a json read from a reader and returns the Project-Object it represents.
     *
     * @param reader reader where
     * @return the project, if the Json was parsed successfully, null if not
     */
    fun deserializeProject(reader: Reader): Project {
        return GSON.fromJson(reader, Project::class.java)
    }

    fun deserializeProjectString(projectString: String): Project {
        return GSON.fromJson(projectString, Project::class.java)
    }
}
