package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import de.maibornwolff.codecharta.model.Cluster
import de.maibornwolff.codecharta.model.ClusterMember
import de.maibornwolff.codecharta.model.ClusterMembership
import de.maibornwolff.codecharta.model.Clustering
import de.maibornwolff.codecharta.model.ClustersLens
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType

/** Writes authors by number only: no name, email or per-author commit data may reach the map. */
internal object AuthorOwnershipLens {
    private const val CLUSTERING_KEY = "author-ownership"
    private const val CLUSTERING_TITLE = "Author ownership"
    private const val WEIGHT_BASIS = "loc"
    private const val ANALYZER = "gitlogparser"
    private const val REPOSITORY_MARKER_LENGTH = 7
    private const val PATH_SEPARATOR = "/"

    // Rounding each share down keeps the sum of a file's shares at or below 1
    private const val WEIGHT_STEPS_PER_UNIT = 10_000L

    fun of(firstCommitHash: String, authorsByFirstCommit: List<String>, blameByPath: Map<String, FileBlame>): ClustersLens {
        val membersByAuthor = HashMap<String, MutableList<ClusterMember>>()
        blameByPath.forEach { (path, blame) ->
            val nodeId = NodeId.fromSegments(path.split(PATH_SEPARATOR), NodeType.File)
            blame.linesByAuthor.forEach { (author, lines) ->
                val weight = roundedDownWeight(lines, blame.totalLines)
                if (weight > 0.0) membersByAuthor.getOrPut(author) { mutableListOf() }.add(ClusterMember(nodeId, weight))
            }
        }
        val clusters = numbered(authorsByFirstCommit, membersByAuthor.keys).mapNotNull { (author, number) ->
            membersByAuthor[author]?.let { members -> clusterOf(firstCommitHash, number, members) }
        }
        if (clusters.isEmpty()) return ClustersLens()
        return ClustersLens(
            mapOf(CLUSTERING_KEY to Clustering(CLUSTERING_TITLE, ClusterMembership.WEIGHTED, listOf(ANALYZER), clusters, WEIGHT_BASIS))
        )
    }

    private fun roundedDownWeight(lines: Int, totalLines: Int): Double =
        (lines * WEIGHT_STEPS_PER_UNIT / totalLines) / WEIGHT_STEPS_PER_UNIT.toDouble()

    // An author with no surviving line still takes up a number, so the numbers stay put as lines come and go. Blame
    // and log share git's mailmap, so a blamed author missing from the log is not expected; it still gets a stable number.
    private fun numbered(authorsByFirstCommit: List<String>, blamedAuthors: Set<String>): List<Pair<String, Int>> {
        val authors = authorsByFirstCommit.distinct() + (blamedAuthors - authorsByFirstCommit.toSet()).sorted()
        return authors.mapIndexed { index, author -> author to index + 1 }
    }

    private fun clusterOf(firstCommitHash: String, number: Int, members: List<ClusterMember>): Cluster = Cluster(
        id = "${firstCommitHash.take(REPOSITORY_MARKER_LENGTH)}-author-$number",
        name = "Author $number",
        members = members.sortedBy { it.nodeId }
    )
}
