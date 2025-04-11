package de.maibornwolff.codecharta.analysers.parsers.rawtext

import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

class ProjectGenerator(private val projectBuilder: ProjectBuilder = ProjectBuilder()) {
    fun generate(projectMetrics: ProjectMetrics, maxIndentLevel: Int, pipedProject: Project?): Project {
        addMetricsAsNodes(projectMetrics.metricsMap)
        var project =
            projectBuilder.addAttributeDescriptions(getAttributeDescriptors(maxIndentLevel))
                .build(cleanAttributeDescriptors = true)

        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        return project
    }

    private fun addMetricsAsNodes(metricsMap: Map<String, FileMetrics>) {
        metricsMap.forEach { (key, fileMetrics) ->
            val (directory, fileName) = splitDirectoryAndFileName(key)
            val node = MutableNode(fileName, attributes = fileMetrics.metricsMap)
            val path = PathFactory.fromFileSystemPath(directory)
            projectBuilder.insertByPath(path, node)
        }
    }

    private fun splitDirectoryAndFileName(path: String): Pair<String, String> {
        val lastSlashIndex = path.lastIndexOf("/")
        val directory = if (lastSlashIndex != -1) path.substring(0, lastSlashIndex) else ""
        val fileName = if (lastSlashIndex != -1) path.substring(lastSlashIndex + 1) else path
        return directory to fileName
    }
}
