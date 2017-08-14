package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Project

class ProjectMerger(val projects: List<Project>, val nodeMerger: NodeMergerStrategy) {

    fun extractProjectName(): String {
        val projectNames = projects.map { p -> p.projectName }.toSortedSet()
        when (projectNames.size) {
            1 -> return projectNames.first()
            else -> throw MergeException("Projects contain several project names : " + projectNames)
        }
    }

    fun extractApiVersion(): String {
        val apiVersion = projects.map { p -> p.apiVersion }.toSortedSet()
        when (apiVersion.size) {
            1 -> return apiVersion.first()
            else -> throw MergeException("Projects use multiple Api-Versions of CodeCharta : " + apiVersion)
        }
    }

    fun merge(): Project {
        val apiVersion = extractApiVersion()
        val name = extractProjectName()
        if (apiVersion != Project.API_VERSION) {
            throw MergeException("API-Version $apiVersion of project is not supported.")
        }
        return Project(name, mergeProjectNodes())
    }

    private fun mergeProjectNodes(): List<Node> {
        return nodeMerger.mergeNodeLists(projects.map { p -> p.nodes!! })
    }

}


