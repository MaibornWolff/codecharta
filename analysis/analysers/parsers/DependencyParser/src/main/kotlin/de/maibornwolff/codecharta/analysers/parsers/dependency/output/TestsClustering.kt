package de.maibornwolff.codecharta.analysers.parsers.dependency.output

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.TestLink
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.TestLinks
import de.maibornwolff.codecharta.model.Cluster
import de.maibornwolff.codecharta.model.ClusterMember
import de.maibornwolff.codecharta.model.ClusterMembership
import de.maibornwolff.codecharta.model.Clustering
import de.maibornwolff.codecharta.model.ClustersLens
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType

/**
 * One cluster per test file that names code, its members the code files it names, and one per code file with tests
 * inside, which test that file too. A cluster takes the node id of the file holding the tests, so a view finds the test
 * like a member, and its file name. A test file that names no code has no cluster; the `test_file` metric still counts it.
 */
internal object TestsClustering {
    const val CLUSTERING_KEY = "tests"
    private const val CLUSTERING_TITLE = "Tests"
    private const val INLINE_NAME_SUFFIX = " (tests inside)"

    fun of(testLinks: TestLinks): ClustersLens {
        val clusters = testLinks.links
            .sortedWith(compareBy({ it.test.graphId }, { it.isInline }))
            .map { clusterOf(it) }
        if (clusters.isEmpty()) return ClustersLens()
        val clustering = Clustering(CLUSTERING_TITLE, ClusterMembership.OVERLAY, ANALYSER_NAME.toList(), clusters)
        return ClustersLens(mapOf(CLUSTERING_KEY to clustering))
    }

    private fun clusterOf(link: TestLink): Cluster {
        val fileName = link.test.segments.last()
        val members = link.codeFiles.map { ClusterMember(NodeId.fromSegments(it.segments, NodeType.File)) }
        val name = if (link.isInline) fileName + INLINE_NAME_SUFFIX else fileName
        return Cluster(id = NodeId.fromSegments(link.test.segments, NodeType.File), name = name, members = members)
    }
}
