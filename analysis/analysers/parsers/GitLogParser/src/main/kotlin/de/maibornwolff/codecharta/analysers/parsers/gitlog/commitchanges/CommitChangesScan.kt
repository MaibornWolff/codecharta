package de.maibornwolff.codecharta.analysers.parsers.gitlog.commitchanges

import de.maibornwolff.codecharta.analysers.parsers.gitlog.authors.AuthorHistory
import de.maibornwolff.codecharta.analysers.parsers.gitlog.authors.AuthorPseudonyms
import de.maibornwolff.codecharta.analysers.parsers.gitlog.util.GitCommand
import de.maibornwolff.codecharta.model.ClustersLens
import java.io.File
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeParseException

/** Measures what each non-merge commit made since a day changed in the files of today, and who made it with whom. */
class CommitChangesScan(
    repositoryFolder: File,
    private val since: LocalDate,
    private val withAuthorNames: Boolean = false,
    private val history: AuthorHistory = AuthorHistory(repositoryFolder)
) {
    private val git = GitCommand(repositoryFolder)

    fun lens(): ClustersLens = CommitChangesLens.of(commitsNewestFirst(), linesByPathToday(), peopleByHash())

    fun isShallowClone(): Boolean = git.isShallowClone()

    private fun commitsNewestFirst(): List<LoggedCommit> {
        val sinceEpochSecond = since.atStartOfDay(ZoneOffset.UTC).toEpochSecond()
        val output = git.outputOrNull(
            "-c",
            "i18n.logOutputEncoding=UTF-8",
            "log",
            "--no-merges",
            "--topo-order",
            "--since-as-filter=$sinceEpochSecond",
            "--relative",
            "-M",
            "--numstat",
            "-z",
            CommitLogOutput.FORMAT
        ) { it.readBytes().toString(Charsets.UTF_8) }
        checkNotNull(output) { GIT_TOO_OLD_ERROR }
        // Git reads a far-future --since as the current time, which lets a commit of this very second through
        return CommitLogOutput.parse(output).filter { it.committedAtEpochSecond >= sinceEpochSecond }
    }

    private fun peopleByHash(): Map<String, List<String>> {
        val commits = history.commitsOldestFirst
        if (withAuthorNames) return commits.associate { it.hash to it.people }
        val pseudonymByPerson = AuthorPseudonyms.byPerson(commits)
        return commits.associate { commit -> commit.hash to commit.people.map { pseudonymByPerson.getValue(it) } }
    }

    private fun linesByPathToday(): Map<String, Int?> = git.numstatOfHead().associate { row ->
        val (added, _, path) = row.split(TAB, limit = NUMSTAT_FIELD_COUNT)
        path to added.toIntOrNull()
    }

    companion object {
        const val FLAG = "--commit-changes-since"
        const val DATE_LABEL = "YYYY-MM-DD"
        const val OPTION_DESCRIPTION =
            "adds one cluster per commit since this day (UTC) with what it changed in each file and who made it, " +
                "under an invented name; subjects enter the map (needs the git history)"
        const val DIALOG_QUESTION =
            "Add what each commit since a day changed and who made it? Their subjects and authors enter the map, " +
                "the authors under invented names unless you chose real ones."
        const val DIALOG_HINT = "$DATE_LABEL (leave empty for no)"
        const val DIALOG_INVALID_DATE = "Please enter a date as $DATE_LABEL."
        const val NEEDS_REPOSITORY_HINT =
            "$FLAG needs the repository to read each commit's changes, which a log file cannot provide. " +
                "Use 'gitlogparser repo-scan $FLAG' instead."
        const val PERSONAL_DATA_NOTE =
            "Note: each commit in this map names its author and co-authors, under invented names unless real names were " +
                "asked for, and its subject is free text. Invented names are pseudonymous, not anonymous: anyone with the " +
                "repository can match them to people, so the map may still be personal data under GDPR."
        const val SHALLOW_CLONE_WARNING =
            "Warning: this repository is a shallow clone, so its oldest commit counts every file as changed " +
                "and its invented author names are not stable. Fetch the full history to get its real changes and stable names."
        const val GIT_TOO_OLD_ERROR = "git could not list the commits for $FLAG, which needs git 2.37 or newer."

        private const val TAB = "\t"
        private const val NUMSTAT_FIELD_COUNT = 3

        fun noCommitHint(since: LocalDate): String = "No commit since $since changed a file on the map, so the map has no commit changes."

        fun carriesCommitChanges(clusters: ClustersLens): Boolean = CommitChangesLens.CLUSTERING_KEY in clusters.clusterings

        fun isDate(input: String): Boolean = try {
            LocalDate.parse(input)
            true
        } catch (_: DateTimeParseException) {
            false
        }
    }
}
