package de.maibornwolff.codecharta.parser.rawtextparser

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

class ProjectGenerator() {
    private lateinit var projectBuilder: ProjectBuilder

    fun generate(projectMetrics: ProjectMetrics, pipedProject: Project?): Project {
        projectBuilder = ProjectBuilder()
        projectMetrics.metricsMap.forEach { addAsNode(it) }
        var project = projectBuilder.build()
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }
        return project
    }

    private fun addAsNode(metrics: Map.Entry<String, FileMetrics>) {
        var directory = ""
        var fileName = metrics.key
        if (fileName.contains("/")) {
            directory = metrics.key.substringBeforeLast("/")
            fileName = metrics.key.substringAfterLast("/")
        }

        val node = MutableNode(fileName, attributes = metrics.value.metricsMap)
        val path = PathFactory.fromFileSystemPath(directory)
        projectBuilder.insertByPath(path, node)
    }
}
