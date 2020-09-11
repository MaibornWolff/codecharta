package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.Writer

class JSONMetricWriter(private val writer: Writer, private val filePath: String, private val toCompress: Boolean) :
    MetricWriter {
    private val projectBuilder = ProjectBuilder()

    override fun generate(projectMetrics: ProjectMetrics, allMetrics: Set<String>, pipedProject: Project?) {

        projectMetrics.projectMetrics.forEach { addAsNode(it) }

        var project = projectBuilder.build()
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        if (toCompress && filePath != "notSpecified") ProjectSerializer.serializeCompressedFileAndDeleteJsonFile(
            project,
            filePath,
            writer
        ) else ProjectSerializer.serializeProject(project, writer)
    }

    private fun addAsNode(metrics: Map.Entry<String, FileMetricMap>) {
        var directory = ""
        var fileName = metrics.key
        if (fileName.contains("/")) {
            directory = metrics.key.substringBeforeLast("/")
            fileName = metrics.key.substringAfterLast("/")
        }

        val node = MutableNode(
            fileName,
            attributes = metrics.value.fileMetrics
        )
        val path = PathFactory.fromFileSystemPath(directory)
        projectBuilder.insertByPath(path, node)
    }
}
