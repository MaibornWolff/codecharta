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
import de.maibornwolff.codecharta.model.Project

import java.io.BufferedWriter
import java.io.FileWriter
import java.io.IOException
import java.io.Writer

/**
 * This class provides static methods and functions to convert a Project-Object to json
 */
object ProjectSerializer {

    private val GSON = GsonBuilder().create()

    /**
     * This method serializes a Project-Object to json and writes it into the specified file.
     *
     * @param project    the Project-Object to be serialized
     * @param targetPath the path of the output-file
     */
    @Throws(IOException::class)
    fun serializeProjectAndWriteToFile(project: Project, targetPath: String) {

        try {
            BufferedWriter(FileWriter(targetPath)).use { serializeProject(project, it) }
        } catch (e: IOException) {
            throw IOException("There was an Error while writing the file at $targetPath", e)
        }

    }

    /**
     * This method serializes a Project-Object to json and writes using given writer
     *
     * @param project the Project-Object to be serialized
     * @param out     writer to write serialized object
     */
    @Throws(IOException::class)
    fun serializeProject(project: Project, out: Writer) {
        GSON.toJson(project, Project::class.java, out)
        out.flush()
    }
}
