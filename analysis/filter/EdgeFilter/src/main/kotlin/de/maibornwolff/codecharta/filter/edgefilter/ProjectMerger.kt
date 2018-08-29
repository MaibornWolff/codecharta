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
import org.omg.IOP.TaggedComponent

class ProjectMerger(private val project: Project) {

    private val projectBuilder = ProjectBuilder(getProjectName())

    fun getProjectName(): String {
        return project.projectName
    }

    fun merge(): Project {
        insertEdges()
        goThroughAllNodes(project.rootNode.children)
        return projectBuilder.build()
    }

    private fun insertEdges() {
        project.edges.forEach {
            projectBuilder.insertEdge(it)
        }
    }

    private fun goThroughAllNodes(nodes: List<Node>, parentPath: MutableList<String> = mutableListOf()) {
        nodes.forEach {
            insertRowInProject(it, parentPath)
            if (!it.children.isEmpty()) {
                parentPath.add(it.name)
                goThroughAllNodes(it.children, parentPath)
            }
        }
    }

    private fun insertRowInProject(node: Node, parentPath: MutableList<String>) {
        val newNode = Node(node.name, node.type, getAttributes(node, parentPath), node.link)
        try {
            projectBuilder.insertByPath(Path(parentPath.toList()), newNode.toMutableNode())
        } catch (e: IllegalArgumentException) {
            System.err.println(e.message)
        }
    }

    private fun getAttributes(node: Node, parentPath: MutableList<String>): Map<String, Any> {
        val newAttributes: MutableMap<String, Any> = mutableMapOf()
        newAttributes.putAll(node.attributes)
        newAttributes.putAll(getAggregatedEdgeAttributes(node, parentPath))
        return newAttributes.toMap()
    }

    private fun getAggregatedEdgeAttributes(node: Node, parentPath: MutableList<String>): MutableMap<String, Any> {
        val nodePath: String = getPathAsString(parentPath, node.name)
        val edgeAttributes = project.edges.filter { edge ->
            edge.fromNodeName == nodePath || edge.toNodeName == nodePath
        }
        println("-----")
        println("----- " + nodePath)
        println("edgeAttributes: " + edgeAttributes)

        val listOfAttributes: MutableList<String> = mutableListOf()

        edgeAttributes.forEach {
            it.attributes.forEach { key, value ->
                if (!listOfAttributes.contains(key)) {
                    listOfAttributes.add(key)
                }
            }
        }

        println("listOfAttributes: " + listOfAttributes)


        var aggregatedAttributes: MutableMap<String, Any> = mutableMapOf()

        listOfAttributes.forEach {key: String ->
            val aggregationType = getAttributeValueByKey(project.aggregationTypes["edges"]!!, key)
            val filteredAttribute = edgeAttributes.filter { edge: Edge -> edge.attributes.containsKey(key) }
            var aggregatedAttributeValue = filteredAttribute.sumBy { edge: Edge -> edge.attributes.get(key).toString().toFloat().toInt() }

            if (aggregationType == AggregationType.relative) {
                aggregatedAttributeValue /= filteredAttribute.size
            }
            aggregatedAttributes.put(key + "_" + aggregationType, aggregatedAttributeValue)
        }

        println("aggregatedAttributes: " + aggregatedAttributes)

        return aggregatedAttributes
    }

    private fun getPathAsString(path: List<String>, leafName: String, pathSeperator: String = "/"): String {
        var nodePath = pathSeperator + "root"
        path.forEach { nodePath += pathSeperator+ it }
        nodePath += pathSeperator + leafName
        return nodePath
    }

    private fun getAttributeValueByKey(attributes: List<Map<String, AggregationType>>, key: String): AggregationType {
        attributes.forEach {
            if (it.containsKey(key)) return it[key]!!
        }
        return AggregationType.absolute
    }
}