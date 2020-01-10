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

package de.maibornwolff.codecharta.importer.crococosmo

import de.maibornwolff.codecharta.importer.crococosmo.model.Graph
import de.maibornwolff.codecharta.importer.crococosmo.model.SchemaVersion
import de.maibornwolff.codecharta.importer.crococosmo.model.Version
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

class CrococosmoConverter {

    fun convertToProjectsMap(projectName: String, graph: Graph): Map<String, Project> {
        return graph.schema.versions.versions
                .associateBy({ createVersionName(it) }, { createProject(projectName, graph, it.id) })
    }

    private fun createVersionName(it: SchemaVersion) =
            when {
                it.name.isNotEmpty()     -> it.name
                it.revision.isNotEmpty() -> it.revision
                else                     -> it.id
            }

    fun createProject(projectName: String, graph: Graph, version: String = graph.schema.versions.versions.first().id) =
            Project(projectName, createNodeListForProject(graph.nodes, version))

    private fun createNodeListForProject(nodes: List<de.maibornwolff.codecharta.importer.crococosmo.model.Node>,
                                         version: String): List<Node> {
        return listOf(Node("root", NodeType.Folder, mapOf(), "", convertToNodeList(nodes, version)))
    }

    private fun convertToNodeList(origin: List<de.maibornwolff.codecharta.importer.crococosmo.model.Node>,
                                  version: String): List<Node> {
        return when {
            origin.isEmpty() -> listOf()
            else             -> origin.map { convertToNode(it, version) }.reduce { a, b -> a + b }
        }
    }

    private fun convertToNode(origin: de.maibornwolff.codecharta.importer.crococosmo.model.Node,
                              version: String): List<Node> {
        return when {
            origin.name.isNullOrEmpty() -> convertToNodeList(origin.children.orEmpty(), version)
            else                        -> listOf(
                    Node(origin.name, getNodeType(origin), createAttributeListForNode(origin.versions, version), "",
                            convertToNodeList(origin.children.orEmpty(), version)))
        }
    }

    private fun getNodeType(node: de.maibornwolff.codecharta.importer.crococosmo.model.Node): NodeType {
        return when {
            node.versions.orEmpty().isEmpty() -> NodeType.Folder
            else                              -> NodeType.File
        }
    }

    private fun createAttributeListForNode(version: List<Version>?, id: String): Map<String, Float> {
        val correctVersion = version.orEmpty().filter { v -> id == v.id }
        return when {
            correctVersion.isEmpty()                -> mapOf()
            correctVersion.last().attribute != null -> correctVersion.last().attribute!!.map(
                    { Pair(it.name, it.value.toFloat()) }).toMap()
            else                                    -> mapOf()
        }
    }
}
