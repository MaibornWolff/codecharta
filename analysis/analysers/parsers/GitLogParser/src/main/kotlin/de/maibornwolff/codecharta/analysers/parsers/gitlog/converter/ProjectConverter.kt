package de.maibornwolff.codecharta.analysers.parsers.gitlog.converter

import de.maibornwolff.codecharta.analysers.parsers.gitlog.getAttributeDescriptors
import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.VersionControlledFile
import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.VersionControlledFilesInGitProject
import de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.VersionControlledFilesList
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
    private fun addVersionControlledFile(
        projectBuilder: ProjectBuilder,
        versionControlledFile: VersionControlledFile,
        filesInLog: Set<String>
    ) {
        val attributes = extractAttributes(versionControlledFile)
        // Keep only edges whose coupled partner still exists at HEAD (is in the git file list). A coupling
        // edge records the partner under its commit-time name; a partner since renamed or deleted is not in
        // the list, so its edge would point at a path with no node. 1.5 dropped those silently, but the 2.0
        // writer materializes every edge endpoint into a ghost File node. This is the same predicate the
        // node list uses (VersionControlledFilesInGitProject), applied here before the /root/ prefixing.
        val edges = versionControlledFile.getEdgeList().filter { filesInLog.contains(it.toNodeName) }
        val fileName = versionControlledFile.filename.substringAfterLast(PATH_SEPARATOR)
        val newNode = MutableNode(fileName, NodeType.File, attributes, "", mutableSetOf())
        val path =
            PathFactory.fromFileSystemPath(
                versionControlledFile.filename.substringBeforeLast(PATH_SEPARATOR, "")
            )

        projectBuilder.insertByPath(path, newNode)
        edges.forEach {
            projectBuilder.insertEdge(addRootToEdgePaths(it))
        }
        versionControlledFile.removeMetricsToFreeMemory()
    }

    private fun extractAttributes(versionControlledFile: VersionControlledFile): Map<String, Any> = if (containsAuthors) {
        versionControlledFile.metricsMap.plus(
            Pair("authors", versionControlledFile.authors)
        )
    } else {
        versionControlledFile.metricsMap
    }

    private fun addRootToEdgePaths(edge: Edge): Edge {
        edge.fromNodeName = ROOT_PREFIX + edge.fromNodeName
        edge.toNodeName = ROOT_PREFIX + edge.toNodeName
        return edge
    }

    fun convert(versionControlledFiles: VersionControlledFilesList, metricsFactory: MetricsFactory, filesInLog: List<String>): Project {
        val projectBuilder = ProjectBuilder()

        val vcFList = versionControlledFiles.getList()

        val versionControlledFilesInGitProject = VersionControlledFilesInGitProject(vcFList, filesInLog)
        val filesInLogSet = filesInLog.toHashSet()

        versionControlledFilesInGitProject.getListOfVCFilesMatchingGitProject().forEach { vcFile ->
            addVersionControlledFile(projectBuilder, vcFile, filesInLogSet)
        }

        val metrics = metricsFactory.createMetrics()
        projectBuilder.addAttributeTypes(AttributeTypesFactory.createNodeAttributeTypes(metrics))
        projectBuilder.addAttributeTypes(AttributeTypesFactory.createEdgeAttributeTypes(metrics))
        projectBuilder.addAttributeDescriptions(getAttributeDescriptors())

        return projectBuilder.build()
    }

    companion object {
        private const val PATH_SEPARATOR = '/'
        private const val ROOT_PREFIX = "/root/"
    }
}
