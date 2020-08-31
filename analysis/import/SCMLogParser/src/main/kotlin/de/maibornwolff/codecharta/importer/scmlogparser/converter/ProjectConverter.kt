package de.maibornwolff.codecharta.importer.scmlogparser.converter

import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

/**
 * creates Projects from List of VersionControlledFiles
 */
class ProjectConverter(private val containsAuthors: Boolean) {

    private val ROOT_PREFIX = "/root/"

    private fun addVersionControlledFile(projectBuilder: ProjectBuilder, versionControlledFile: VersionControlledFile) {
        val attributes = extractAttributes(versionControlledFile)
        val edges = versionControlledFile.getEdgeList()
        val fileName = versionControlledFile.filename.substringAfterLast(PATH_SEPARATOR)
        val newNode = MutableNode(fileName, NodeType.File, attributes, "", mutableSetOf())
        val path = PathFactory.fromFileSystemPath(
                versionControlledFile.filename.substringBeforeLast(PATH_SEPARATOR, ""))
        projectBuilder.insertByPath(path, newNode)
        edges.forEach { projectBuilder.insertEdge(addRootToEdgePaths(it)) }
        versionControlledFile.removeMetricsToFreeMemory()
    }

    private fun extractAttributes(versionControlledFile: VersionControlledFile): Map<String, Any> {
        return when {
            containsAuthors -> versionControlledFile.metricsMap
                    .plus(Pair("authors", versionControlledFile.authors))
            else -> versionControlledFile.metricsMap
        }
    }

    private fun addRootToEdgePaths(edge: Edge): Edge {
        edge.fromNodeName = ROOT_PREFIX + edge.fromNodeName
        edge.toNodeName = ROOT_PREFIX + edge.toNodeName
        return edge
    }

    fun convert(versionControlledFiles: MutableMap<String, VersionControlledFile>, metricsFactory: MetricsFactory): Project {
        val projectBuilder = ProjectBuilder()

        //TODO discuss/check performance:
        versionControlledFiles.values
                .filter { !it.isDeleted() }
                .forEach { vcFile -> addVersionControlledFile(projectBuilder, vcFile) }

        val metrics = metricsFactory.createMetrics()
        projectBuilder.addAttributeTypes(AttributeTypesFactory.createNodeAttributeTypes(metrics))
        projectBuilder.addAttributeTypes(AttributeTypesFactory.createEdgeAttributeTypes(metrics))

        return projectBuilder.build()
    }

    companion object {
        private const val PATH_SEPARATOR = '/'
    }
}
