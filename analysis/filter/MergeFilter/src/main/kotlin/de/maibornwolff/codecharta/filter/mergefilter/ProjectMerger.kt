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

package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.*
import mu.KotlinLogging

class ProjectMerger(private val projects: List<Project>, private val nodeMerger: NodeMergerStrategy,
                    private val projectName: String? = null) {

    private val logger = KotlinLogging.logger { }

    fun extractProjectName(): String {
        if (projectName != null) return projectName

        val projectNames = projects.map { p -> p.projectName }
        if (!projectNames.all { p -> p == projectNames.first() }) {
            throw MergeException(
                    "Project Names do not match. If files with different project names should be merged, a new project name must be provided using -p.")
        }
        return projectNames.first()
    }

    fun merge(): Project {
        return when {
            areAllAPIVersionsCompatible() -> ProjectBuilder(
                    extractProjectName(),
                    mergeProjectNodes(),
                    mergeEdges(),
                    mergeAttributeTypes(),
                    mergeBlacklist()
            ).build()
            else                          -> throw MergeException("API versions not supported.")
        }
    }

    private fun areAllAPIVersionsCompatible(): Boolean {
        val unsupportedAPIVersions = projects
                .map { it.apiVersion }
                .filter { !Project.isAPIVersionCompatible(it) }

        return unsupportedAPIVersions.isEmpty()
    }

    private fun mergeProjectNodes(): List<MutableNode> {
        val mergedNodes = nodeMerger.mergeNodeLists(projects.map { listOf(it.rootNode.toMutableNode()) })
        nodeMerger.logMergeStats()
        return mergedNodes
    }

    private fun mergeEdges(): MutableList<Edge> {
        return if (nodeMerger.javaClass.simpleName == "RecursiveNodeMergerStrategy") {
            getMergedEdges()
        } else {
            getEdgesOfMasterAndWarnIfDiscards()
        }
    }

    private fun getEdgesOfMasterAndWarnIfDiscards(): MutableList<Edge> {
        projects.forEachIndexed { i, project ->
            if (project.edges.isNotEmpty() && i > 0) logger.warn("Edges of ${project.projectName} were ignored. Use recursive strategy to merge edges.")
        }
        return projects.first().edges.toMutableList()
    }

    private fun getMergedEdges(): MutableList<Edge> {
        val mergedEdges = mutableListOf<Edge>()
        projects.forEach { it.edges.forEach { mergedEdges.add(it) } }
        return mergedEdges.distinctBy { listOf(it.fromNodeName, it.toNodeName) }.toMutableList()
    }

    private fun mergeAttributeTypes(): MutableMap<String, MutableList<Map<String, AttributeType>>> {
        val mergedAttributeTypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf()

        projects.forEach {
            it.attributeTypes.forEach {
                val key: String = it.key
                if (mergedAttributeTypes.containsKey(key)) {
                    it.value.forEach {
                        if (!mergedAttributeTypes[key]!!.contains(it)) {
                            mergedAttributeTypes[key]!!.add(it)
                        }
                    }
                } else {
                    mergedAttributeTypes[key] = it.value.toMutableList()
                }
            }
        }
        return mergedAttributeTypes
    }

    private fun mergeBlacklist(): MutableList<BlacklistItem> {
        val mergedBlacklist = mutableListOf<BlacklistItem>()
        projects.forEach { it.blacklist.forEach { mergedBlacklist.add(it) } }
        return mergedBlacklist.distinctBy { it.toString() }.toMutableList()
    }
}