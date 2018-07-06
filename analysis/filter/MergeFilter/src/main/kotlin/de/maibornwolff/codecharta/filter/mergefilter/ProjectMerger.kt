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

package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.*

class ProjectMerger(private val projects: List<Project>, private val nodeMerger: NodeMergerStrategy) {

    fun extractProjectName(): String {
        val projectNames = projects.map { p -> p.projectName }.toSortedSet()
        when (projectNames.size) {
            1 -> return projectNames.first()
            else -> throw MergeException("Projects contain several project names : $projectNames")
        }
    }


    fun merge(): Project {
        val name = extractProjectName()
        return when {
            areAllAPIVersionsCompatible() -> ProjectBuilder(name, mergeProjectNodes(), getDependencies()).build()
            else -> throw MergeException("API versions not supported.")
        }
    }

    private fun areAllAPIVersionsCompatible(): Boolean {
        val unsupportedAPIVersions = projects
                .map { it.apiVersion }
                .filter { !Project.isAPIVersionCompatible(it) }

        return !unsupportedAPIVersions.isNotEmpty()
    }

    private fun mergeProjectNodes(): List<MutableNode> {
        return nodeMerger.mergeNodeLists(projects.map { listOf(it.rootNode.toMutableNode()) })
    }

    private fun getDependencies(): MutableMap<DependencyType,MutableList<Dependency>> {
        if (nodeMerger.javaClass.simpleName == "RecursiveNodeMergerStrategy") {
            return mergeProjectDependencies()
        } else {
            return mutableMapOf()
        }
    }

    private fun mergeProjectDependencies(): MutableMap<DependencyType, MutableList<Dependency>> {
        val mergedDependencies = mutableMapOf<DependencyType, MutableList<Dependency>>()

        projects.forEach {
            if (it.dependencies != null) {
                it.dependencies.forEach {
                    val dependencyType: DependencyType = it.key

                    if (mergedDependencies.get(dependencyType) == null) {
                        mergedDependencies.put(dependencyType, mutableListOf())
                    }

                    it.value.forEach {
                        mergedDependencies.get(dependencyType)!!.add(it)
                    }
                }
            }
        }
        return mergedDependencies
    }
}