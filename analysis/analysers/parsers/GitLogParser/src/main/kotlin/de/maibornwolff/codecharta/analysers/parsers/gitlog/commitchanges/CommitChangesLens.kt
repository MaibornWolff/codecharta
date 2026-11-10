package de.maibornwolff.codecharta.analysers.parsers.gitlog.commitchanges

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.DefaultSemanticCommitStyle
import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.HotfixCommits
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.Cluster
import de.maibornwolff.codecharta.model.ClusterMember
import de.maibornwolff.codecharta.model.ClusterMembership
import de.maibornwolff.codecharta.model.Clustering
import de.maibornwolff.codecharta.model.ClustersLens
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import java.time.Instant
import java.time.ZoneOffset
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min

/** Writes what each commit changed in the files of today; a commit's changes follow a renamed file to its path today. */
internal object CommitChangesLens {
    const val CLUSTERING_KEY = "commit-changes"
    private const val CLUSTERING_TITLE = "Commit changes"
    private const val WEIGHT_BASIS = "loc"
    private const val ANALYZER = "gitlogparser"
    private const val SHORT_HASH_LENGTH = 7
    private const val PATH_SEPARATOR = "/"
    private const val DATE_ATTRIBUTE = "date"
    private const val AUTHOR_ATTRIBUTE = "author"
    private const val CO_AUTHORS_ATTRIBUTE = "co_authors"
    private const val CO_AUTHOR_SEPARATOR = "; "
    private const val CHANGED_FILES_ATTRIBUTE = "changed_files"
    private const val CHANGED_LINES_ATTRIBUTE = "changed_lines"
    private const val COMMIT_TYPE_ATTRIBUTE = "commit_type"
    private const val HOTFIX_ATTRIBUTE = "hotfix"
    private const val IS_HOTFIX = 1
    private const val WEIGHT_STEPS_PER_UNIT = 10_000.0
    private const val SMALLEST_WEIGHT = 1 / WEIGHT_STEPS_PER_UNIT

    private val ATTRIBUTE_TYPES = mapOf(
        CHANGED_FILES_ATTRIBUTE to AttributeType.ABSOLUTE,
        CHANGED_LINES_ATTRIBUTE to AttributeType.ABSOLUTE,
        HOTFIX_ATTRIBUTE to AttributeType.ABSOLUTE
    )
    private val ATTRIBUTE_DESCRIPTORS = mapOf(
        DATE_ATTRIBUTE to descriptor("Date", "Day the commit was made, in UTC"),
        AUTHOR_ATTRIBUTE to
            descriptor("Author", "Who made the commit, under an invented name unless real names were asked for"),
        CO_AUTHORS_ATTRIBUTE to
            descriptor("Co-authors", "Who the commit names as co-authors, under invented names unless real names were asked for"),
        CHANGED_FILES_ATTRIBUTE to descriptor("Files changed", "Files the whole commit changed, including those gone today"),
        CHANGED_LINES_ATTRIBUTE to
            descriptor("Lines changed", "Lines the whole commit added and removed, including those of files gone today"),
        COMMIT_TYPE_ATTRIBUTE to
            descriptor(
                "Commit type",
                "Type the subject starts with (feat, fix, docs, style, refactor, test), as the *_commits metrics count"
            ),
        HOTFIX_ATTRIBUTE to descriptor("Hotfix", "1 when the subject names a hotfix, as the hotfix_commits metric counts it")
    )

    private fun descriptor(title: String, description: String) = AttributeDescriptor(
        title = title,
        description = description,
        analyzers = setOf(ANALYZER)
    )

    /**
     * [linesByPathToday] holds every file at HEAD, with null for a binary one, and [peopleByHash] the names to write for each
     * commit, its author first and then its co-authors.
     */
    fun of(
        commitsNewestFirst: List<LoggedCommit>,
        linesByPathToday: Map<String, Int?>,
        peopleByHash: Map<String, List<String>>
    ): ClustersLens {
        val pathTodayByOldPath = HashMap<String, String>()
        val clusters = commitsNewestFirst.mapNotNull { commit ->
            val members = membersOf(commit, pathTodayByOldPath, linesByPathToday)
            commit.changes.forEach { change ->
                change.pathBefore?.let { pathTodayByOldPath[it] = pathTodayByOldPath[change.path] ?: change.path }
            }
            if (members.isEmpty()) null else clusterOf(commit, members, peopleByHash[commit.hash].orEmpty())
        }
        if (clusters.isEmpty()) return ClustersLens()
        val clustering = Clustering(
            CLUSTERING_TITLE,
            ClusterMembership.OVERLAY,
            listOf(ANALYZER),
            clusters,
            WEIGHT_BASIS,
            ATTRIBUTE_TYPES,
            ATTRIBUTE_DESCRIPTORS
        )
        return ClustersLens(mapOf(CLUSTERING_KEY to clustering))
    }

    private fun membersOf(
        commit: LoggedCommit,
        pathTodayByOldPath: Map<String, String>,
        linesByPathToday: Map<String, Int?>
    ): List<ClusterMember> = commit.changes
        .mapNotNull { change ->
            val path = pathTodayByOldPath[change.path] ?: change.path
            val changesContent = change.changedLines != 0
            if (changesContent && path in linesByPathToday) {
                ClusterMember(NodeId.fromSegments(path.split(PATH_SEPARATOR), NodeType.File), weightOf(change, linesByPathToday[path]))
            } else {
                null
            }
        }.distinctBy { it.nodeId }
        .sortedBy { it.nodeId }

    // No line count to relate to means no fraction to state, and an omitted weight is the wire's "the whole file"
    private fun weightOf(change: FileChange, linesToday: Int?): Double? {
        val changedLines = change.changedLines
        if (changedLines == null || linesToday == null || linesToday == 0) return null
        val cappedShare = min(1.0, changedLines.toDouble() / linesToday)
        return max(SMALLEST_WEIGHT, floor(cappedShare * WEIGHT_STEPS_PER_UNIT) / WEIGHT_STEPS_PER_UNIT)
    }

    private fun clusterOf(commit: LoggedCommit, members: List<ClusterMember>, people: List<String>): Cluster = Cluster(
        id = commit.hash,
        name = "${commit.hash.take(SHORT_HASH_LENGTH)} ${commit.subject}".trim(),
        members = members,
        attributes = listOfNotNull(
            DATE_ATTRIBUTE to dateOf(commit),
            people.firstOrNull()?.let { AUTHOR_ATTRIBUTE to it },
            coAuthorsOf(people)?.let { CO_AUTHORS_ATTRIBUTE to it },
            CHANGED_FILES_ATTRIBUTE to commit.changes.size,
            CHANGED_LINES_ATTRIBUTE to commit.changes.sumOf { it.changedLines ?: 0 },
            DefaultSemanticCommitStyle.typeOf(commit.subject)?.let { COMMIT_TYPE_ATTRIBUTE to it.name },
            (HOTFIX_ATTRIBUTE to IS_HOTFIX).takeIf { HotfixCommits.isHotfix(commit.subject) }
        ).toMap()
    )

    private fun coAuthorsOf(people: List<String>): String? =
        people.distinct().drop(1).takeIf { it.isNotEmpty() }?.joinToString(CO_AUTHOR_SEPARATOR)

    private fun dateOf(commit: LoggedCommit): String =
        Instant.ofEpochSecond(commit.committedAtEpochSecond).atOffset(ZoneOffset.UTC).toLocalDate().toString()
}
