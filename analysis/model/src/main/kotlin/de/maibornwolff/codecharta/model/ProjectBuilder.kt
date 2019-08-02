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

package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.attributeTypes.AttributeTypes
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import mu.KotlinLogging

open class ProjectBuilder(
        val projectName: String,
        private val nodes: List<MutableNode> = listOf(MutableNode("root", NodeType.Folder)),
        private var edges: MutableList<Edge> = mutableListOf(),
        private var attributeTypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf(),
        private var blacklist: MutableList<BlacklistItem> = mutableListOf()
) {

    init {
        if (nodes.size != 1) throw IllegalStateException("No unique root node was found, instead ${nodes.size} candidates identified.")
    }

    private val logger = KotlinLogging.logger {}

    val rootNode: MutableNode
        get() = nodes[0]

    val size: Int
        get() = rootNode.size

    /**
     * Inserts the node as child of the element at the specified position in the tree.
     *
     * @param position absolute path to the parent element of the node that has to be inserted
     * @param node     that has to be inserted
     */
    fun insertByPath(position: Path, node: MutableNode): ProjectBuilder {
        rootNode.insertAt(position, node)
        return this
    }

    fun insertEdge(thisEdge: Edge): ProjectBuilder {
        edges.add(thisEdge)
        return this
    }

    private var metricNameTranslator: MetricNameTranslator = MetricNameTranslator.TRIVIAL

    private var filterRule: (MutableNode) -> Boolean = { true }

    fun withMetricTranslator(metricNameTranslator: MetricNameTranslator): ProjectBuilder {
        this.metricNameTranslator = metricNameTranslator
        return this
    }

    fun withFilter(filterRule: (MutableNode) -> Boolean = { true }): ProjectBuilder {
        this.filterRule = filterRule
        return this
    }

    fun build(): Project {
        nodes.flatMap { it.nodes.values }
                .mapNotNull { it.filterChildren(filterRule, false) }
                .map { it.translateMetrics(metricNameTranslator, false) }

        edges.forEach { it.translateMetrics(metricNameTranslator) }

        filterEmptyFolders()

        val project = Project(
                projectName,
                nodes.map { it.toNode() }.toList(),
                edges = edges.toList(),
                attributeTypes = attributeTypes.toMap(),
                blacklist = blacklist.toList()
        )

        System.err.println()
        logger.info { "Created Project with ${project.size} leaves." }

        return project
    }

    private fun filterEmptyFolders() {
        nodes.forEach { it.filterChildren({ !it.isEmptyFolder }, true) }
    }

    fun addAttributeTypes(attributeTypesToAdd: AttributeTypes): ProjectBuilder {
        if (!attributeTypes.containsKey(attributeTypesToAdd.type)) {
            attributeTypes[attributeTypesToAdd.type] = mutableListOf(attributeTypesToAdd.attributeTypes)
        } else {
            attributeTypes[attributeTypesToAdd.type]!!.add(attributeTypesToAdd.attributeTypes)
        }
        return this
    }

    override fun toString(): String {
        return "Project{projectName='$projectName', nodes=$nodes, edges=$edges, attributeTypes=$attributeTypes, blacklist=$blacklist}"
    }
}