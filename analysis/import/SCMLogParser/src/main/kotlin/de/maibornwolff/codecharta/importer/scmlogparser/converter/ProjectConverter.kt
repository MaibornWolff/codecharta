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

package de.maibornwolff.codecharta.importer.scmlogparser.converter

import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.model.*

import java.util.*

/**
 * creates Projects from List of VersionControlledFiles
 */
class ProjectConverter(private val containsAuthors: Boolean, private val projectName: String) {

    private fun addVersionControlledFile(projectBuilder: ProjectBuilder, versionControlledFile: VersionControlledFile) {
        val attributes = extractAttributes(versionControlledFile)
        val fileName = versionControlledFile.actualFilename.substringAfterLast(PATH_SEPARATOR)
        val newNode = MutableNode(fileName, NodeType.File, attributes, "", ArrayList())
        val path = PathFactory.fromFileSystemPath(
                versionControlledFile.actualFilename.substringBeforeLast(PATH_SEPARATOR, ""))
        projectBuilder.insertByPath(path, newNode)
    }

    private fun extractAttributes(versionControlledFile: VersionControlledFile): Map<String, Any> {
        return when {
            containsAuthors -> versionControlledFile.metricsMap
                    .plus(Pair("authors", versionControlledFile.authors))
            else            -> versionControlledFile.metricsMap
        }
    }

    fun convert(versionControlledFiles: List<VersionControlledFile>): Project {
        val projectBuilder = ProjectBuilder(projectName)

        versionControlledFiles
                .filter { vc -> !vc.markedDeleted() }
                .forEach { vcFile -> addVersionControlledFile(projectBuilder, vcFile) }

        return projectBuilder.build()
    }

    companion object {
        private const val PATH_SEPARATOR = '/'
    }
}
