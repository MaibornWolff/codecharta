package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import de.maibornwolff.codecharta.model.Cluster
import de.maibornwolff.codecharta.model.ClusterMember
import de.maibornwolff.codecharta.model.ClusterMembership
import de.maibornwolff.codecharta.model.Clustering
import de.maibornwolff.codecharta.model.ClustersLens
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import java.math.BigInteger

/** A commit's author and co-authors, the author first. */
internal data class CommitPeople(val hash: String, val people: List<String>)

/** Writes authors by pseudonym, unless real names were asked for; an email or per-author commit data never reaches the map. */
internal object AuthorOwnershipLens {
    private const val CLUSTERING_KEY = "author-ownership"
    private const val CLUSTERING_TITLE = "Author ownership"
    const val CLUSTERING_KEY_WITH_NAMES = "author-ownership-with-names"
    private const val CLUSTERING_TITLE_WITH_NAMES = "Author ownership (real names)"
    private const val WEIGHT_BASIS = "loc"
    private const val ANALYZER = "gitlogparser"
    private const val REPOSITORY_MARKER_LENGTH = 7
    private const val PATH_SEPARATOR = "/"

    // Rounding each share down keeps the sum of a file's shares at or below 1
    private val WEIGHT_STEPS_PER_UNIT = BigInteger.valueOf(10_000L)

    /** [commitsOldestFirst] holds at least the commits of the blamed lines; a line of any other commit stays unattributed. */
    fun of(commitsOldestFirst: List<CommitPeople>, blameByPath: Map<String, FileBlame>, withNames: Boolean = false): ClustersLens {
        val firstCommitHash = commitsOldestFirst.firstOrNull()?.hash ?: return ClustersLens()
        val peopleByCommit = commitsOldestFirst.associate { it.hash to it.people }
        val membersByPerson = HashMap<String, MutableList<ClusterMember>>()
        blameByPath.forEach { (path, blame) ->
            val nodeId = NodeId.fromSegments(path.split(PATH_SEPARATOR), NodeType.File)
            weightsOf(blame, peopleByCommit).forEach { (person, weight) ->
                membersByPerson.getOrPut(person) { mutableListOf() }.add(ClusterMember(nodeId, weight))
            }
        }
        val pseudonyms = AuthorPseudonyms(firstCommitHash)
        // Sorted by id, as the order of first commits would otherwise show through the pseudonyms
        val clusters = peopleInOrderOfFirstCommit(commitsOldestFirst)
            .mapIndexedNotNull { position, person ->
                membersByPerson[person]?.let { members ->
                    val pseudonym = pseudonyms.nameOf(position)
                    clusterOf(firstCommitHash, pseudonym, if (withNames) person else pseudonym, members)
                }
            }.sortedBy { it.id }
        if (clusters.isEmpty()) return ClustersLens()
        // A key of its own, so that merging a named map with a pseudonymous one never mixes the two in one list
        val key = if (withNames) CLUSTERING_KEY_WITH_NAMES else CLUSTERING_KEY
        val title = if (withNames) CLUSTERING_TITLE_WITH_NAMES else CLUSTERING_TITLE
        return ClustersLens(mapOf(key to Clustering(title, ClusterMembership.WEIGHTED, listOf(ANALYZER), clusters, WEIGHT_BASIS)))
    }

    // A commit's lines are split equally among its people. Counting in parts of a line every commit's split divides
    // into evenly keeps the sums exact, so the result depends neither on the order of the commits nor on rounding.
    private fun weightsOf(blame: FileBlame, peopleByCommit: Map<String, List<String>>): Map<String, Double> {
        val blamedCommits = blame.linesByCommit.mapNotNull { (hash, lines) -> peopleByCommit[hash]?.let { it to lines } }
        val partsPerLine = blamedCommits
            .map { (people, _) -> BigInteger.valueOf(people.size.toLong()) }
            .fold(BigInteger.ONE) { common, peopleCount -> common * peopleCount / common.gcd(peopleCount) }
        val partsByPerson = HashMap<String, BigInteger>()
        blamedCommits.forEach { (people, lines) ->
            val partsOfEach = partsPerLine * BigInteger.valueOf(lines.toLong()) / BigInteger.valueOf(people.size.toLong())
            people.forEach { person -> partsByPerson.merge(person, partsOfEach, BigInteger::add) }
        }
        val partsOfFile = partsPerLine * BigInteger.valueOf(blame.totalLines.toLong())
        return partsByPerson
            .mapValues { (_, parts) -> (parts * WEIGHT_STEPS_PER_UNIT / partsOfFile).toDouble() / WEIGHT_STEPS_PER_UNIT.toDouble() }
            .filterValues { it > 0.0 }
    }

    // Someone with no surviving line still takes up a position, so the pseudonyms stay put as lines come and go
    private fun peopleInOrderOfFirstCommit(commitsOldestFirst: List<CommitPeople>): List<String> =
        commitsOldestFirst.flatMap { it.people }.distinct()

    private fun clusterOf(firstCommitHash: String, pseudonym: String, name: String, members: List<ClusterMember>): Cluster = Cluster(
        id = "${firstCommitHash.take(REPOSITORY_MARKER_LENGTH)}-author-${pseudonym.lowercase().replace(' ', '-')}",
        name = name,
        members = members.sortedBy { it.nodeId }
    )
}
