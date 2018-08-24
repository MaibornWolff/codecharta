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

import de.maibornwolff.codecharta.model.*

class ProjectMerger(private val project: Project, private val recursiveNodeMergerStrategy: RecursiveNodeMergerStrategy) {

    private val projectBuilder = ProjectBuilder(getProjectName())

    fun getProjectName(): String {
        return project.projectName
    }

    fun merge(): Project {
        insertEdges()
        goThroughAllNodes(listOf(project.rootNode.toMutableNode()))
        return projectBuilder.build()
    }

    private fun insertEdges() {
        project.edges.forEach {
            projectBuilder.insertEdge(it)
        }
    }

    private fun goThroughAllNodes(nodes: List<MutableNode>) {
        nodes.forEach {
            insertRowInProject(it.toNode())
            if (!it.children.isEmpty()) {
                goThroughAllNodes(it.children)
            }
        }
    }

    private fun getAttributes(node: Node): Map<String, Any> {
        val newAttributes: MutableMap<String, Any> = mutableMapOf()
        newAttributes.putAll(getAggregatedEdgeAttributes(node))
        return newAttributes.toMap()
    }

    private fun getAggregatedEdgeAttributes(node: Node): MutableMap<String, Any> {
        val edgeAttributes = project.edges.filter { edge ->
            edge.fromNodeName == node.asTreeNode().name
                    || edge.toNodeName == node.asTreeNode().name
        }
        //val attributeTypes
        return mutableMapOf()
    }


    private fun insertRowInProject(node: Node) {
        val newNode = Node(node.name, node.type, getAttributes(node), node.link, node.children)
        try {
            val path = Path(listOf((newNode.asTreeNode()).name))
            projectBuilder.insertByPath(path, newNode.toMutableNode())
        } catch (e: IllegalArgumentException) {
            System.err.println(e.message)
        }
    }
}