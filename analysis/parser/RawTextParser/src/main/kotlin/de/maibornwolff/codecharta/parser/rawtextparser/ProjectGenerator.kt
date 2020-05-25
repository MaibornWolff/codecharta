package de.maibornwolff.codecharta.parser.rawtextparser

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.parser.rawtextparser.model.FileMetrics
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer.serializeCompressedFileAndDeleteJsonFile
import java.io.Writer

class ProjectGenerator(private val writer: Writer, private val filePath: String, private val toCompress: Boolean) {
    private lateinit var projectBuilder: ProjectBuilder

    fun generate(metricMap: Map<String, FileMetrics>, pipedProject: Project?) {
        projectBuilder = ProjectBuilder()
        metricMap.forEach { addAsNode(it) }

        var project = projectBuilder.build()
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        if(toCompress && filePath != "notSpecified") serializeCompressedFileAndDeleteJsonFile(project, filePath, writer) else ProjectSerializer.serializeProject(project, writer)

    }


    private fun addAsNode(metrics: Map.Entry<String, FileMetrics>) {
        var directory = ""
        var fileName = metrics.key
        if (fileName.contains("/")) {
            directory = metrics.key.substringBeforeLast("/")
            fileName = metrics.key.substringAfterLast("/")
        }

        val node = MutableNode(fileName, attributes = metrics.value.metricMap)
        val path = PathFactory.fromFileSystemPath(directory)
        projectBuilder.insertByPath(path, node)

    }
}