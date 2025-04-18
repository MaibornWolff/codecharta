package de.maibornwolff.codecharta.analysers.parsers.svnlog.converter

import de.maibornwolff.codecharta.analysers.parsers.svnlog.getAttributeDescriptors
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.VersionControlledFile
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics.MetricsFactory
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
    private fun addVersionControlledFile(projectBuilder: ProjectBuilder, versionControlledFile: VersionControlledFile) {
        val attributes = extractAttributes(versionControlledFile)
        val edges = versionControlledFile.getEdgeList()
        val fileName = versionControlledFile.actualFilename.substringAfterLast(PATH_SEPARATOR)
        val newNode = MutableNode(fileName, NodeType.File, attributes, "", mutableSetOf())
        val path =
            PathFactory.fromFileSystemPath(
                versionControlledFile.actualFilename.substringBeforeLast(PATH_SEPARATOR, "")
            )
        projectBuilder.insertByPath(path, newNode)
        edges.forEach { projectBuilder.insertEdge(addRootToEdgePaths(it)) }
        versionControlledFile.removeMetricsToFreeMemory()
    }

    private fun extractAttributes(versionControlledFile: VersionControlledFile): Map<String, Any> {
        return when {
            containsAuthors -> versionControlledFile.metricsMap.plus(Pair("authors", versionControlledFile.authors))

            else -> versionControlledFile.metricsMap
        }
    }

    private fun addRootToEdgePaths(edge: Edge): Edge {
        edge.fromNodeName = ROOT_PREFIX + edge.fromNodeName
        edge.toNodeName = ROOT_PREFIX + edge.toNodeName
        return edge
    }

    fun convert(versionControlledFiles: List<VersionControlledFile>, metricsFactory: MetricsFactory): Project {
        val projectBuilder = ProjectBuilder()

        versionControlledFiles.filter { vc -> !vc.markedDeleted() }
            .forEach { vcFile -> addVersionControlledFile(projectBuilder, vcFile) }

        val metrics = metricsFactory.createMetrics()
        projectBuilder.addAttributeTypes(AttributeTypesFactory.createNodeAttributeTypes(metrics))
        projectBuilder.addAttributeTypes(AttributeTypesFactory.createEdgeAttributeTypes(metrics))
        projectBuilder.addAttributeDescriptions(getAttributeDescriptors())

        return projectBuilder.build(cleanAttributeDescriptors = true)
    }

    companion object {
        private const val PATH_SEPARATOR = '/'
        private const val ROOT_PREFIX = "/root/"
    }
}
