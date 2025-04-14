package de.maibornwolff.codecharta.analysers.parsers.sourcecode.metricwriters

import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.getAttributeDescriptors
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics.FileMetricMap
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics.ProjectMetrics
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.OutputStream

class JSONMetricWriter(private val outputStream: OutputStream, private val toCompress: Boolean) : MetricWriter {
    private val projectBuilder = ProjectBuilder()

    override fun generate(projectMetrics: ProjectMetrics, allMetrics: Set<String>, pipedProject: Project?) {
        projectMetrics.projectMetrics.forEach { addAsNode(it) }

        var project =
            projectBuilder.addAttributeDescriptions(getAttributeDescriptors())
                .build(cleanAttributeDescriptors = true)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        ProjectSerializer.serializeProject(project, outputStream, toCompress)
    }

    private fun addAsNode(metrics: Map.Entry<String, FileMetricMap>) {
        var directory = ""
        var fileName = metrics.key
        if (fileName.contains("/")) {
            directory = metrics.key.substringBeforeLast("/")
            fileName = metrics.key.substringAfterLast("/")
        }

        val node =
            MutableNode(
                fileName,
                attributes = metrics.value.fileMetrics
            )
        val path = PathFactory.fromFileSystemPath(directory)
        projectBuilder.insertByPath(path, node)
    }
}
