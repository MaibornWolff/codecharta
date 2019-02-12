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

package de.maibornwolff.codecharta.model


class Project(
        val projectName: String,
        private val nodes: List<Node> = listOf(Node("root", NodeType.Folder)),
        val apiVersion: String = API_VERSION,
        val edges: List<Edge> = listOf(),
        val attributeTypes: Map<String, List<Map<String, AttributeType>>> = mapOf(),
        var blacklist: List<BlacklistItem> = listOf()
) {
    init {
        if (nodes.size != 1) throw IllegalStateException("no root node present in project")
    }

    val rootNode: Node
        get() = nodes[0]

    val size: Int
        get() = rootNode.size

    fun sizeOfEdges(): Int {
        return edges.size
    }

    fun sizeOfBlacklist(): Int {
        return blacklist.size
    }

    override fun toString(): String {
        return "Project{projectName=$projectName, apiVersion=$apiVersion, nodes=$nodes, edges=$edges, " +
                "attributeTypes=$attributeTypes, blacklist=$blacklist}"
    }

    companion object {
        private const val API_VERSION_MAJOR = "1"
        private const val API_VERSION_MINOR = "1"
        const val API_VERSION = "$API_VERSION_MAJOR.$API_VERSION_MINOR"

        fun isAPIVersionCompatible(apiVersion: String): Boolean {
            val apiVersion_major = apiVersion.split('.')[0]
            return apiVersion_major == API_VERSION_MAJOR
        }
    }

}