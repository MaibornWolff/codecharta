package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import de.maibornwolff.codecharta.analysers.parsers.gitlog.util.GitCommand
import de.maibornwolff.codecharta.model.ClustersLens
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.util.concurrent.Callable
import java.util.concurrent.Executors

/** Measures who made the commits that last changed the lines each file holds today, and gives them pseudonyms by their first commit. */
class AuthorOwnershipScan(private val repositoryFolder: File, private val withNames: Boolean = false) {
    private val git = GitCommand(repositoryFolder)

    fun lens(): ClustersLens = AuthorOwnershipLens.of(commitsOldestFirst(), blameByPath(), withNames)

    fun isShallowClone(): Boolean = git.isShallowClone()

    private fun commitsOldestFirst(): List<CommitPeople> {
        val format = "--format=%H%x00%aN%x00%(trailers:key=Co-authored-by,valueonly,separator=%x01)"
        val rows = git
            .outputOrNull("-c", "i18n.logOutputEncoding=UTF-8", "log", "--reverse", "--topo-order", format) { output ->
                output.bufferedReader(Charsets.UTF_8).useLines { lines -> lines.map { it.split(NUL) }.toList() }
            }.orEmpty()
        val nameByCoAuthor = mappedNames(rows.flatMap { coAuthorsIn(it) }.distinct())
        return rows.map { row ->
            CommitPeople(row[0], (listOf(row[1]) + coAuthorsIn(row).map { nameByCoAuthor.getValue(it) }).distinct())
        }
    }

    private fun coAuthorsIn(logRow: List<String>): List<String> =
        logRow[2].split(TRAILER_SEPARATOR).map { it.trim() }.filter { it.isNotEmpty() }

    // Git applies the mailmap to a commit's author but not to its trailers, so the co-authors are mapped separately
    private fun mappedNames(coAuthors: List<String>): Map<String, String> {
        val withEmail = coAuthors.filter { CONTACT_WITH_EMAIL.matches(it) }
        val input = File.createTempFile("co-authors", ".txt")
        try {
            input.writeText(withEmail.joinToString("\n", postfix = "\n"), Charsets.UTF_8)
            val mapped = git.outputOrNull("check-mailmap", "--stdin", input = input) { it.bufferedReader(Charsets.UTF_8).readLines() }
            val contacts = if (mapped?.size == withEmail.size) withEmail.zip(mapped).toMap() else emptyMap()
            return coAuthors.associateWith { nameOf(contacts[it] ?: it) }
        } finally {
            if (!input.delete()) input.deleteOnExit()
        }
    }

    private fun nameOf(contact: String): String = contact.substringBefore(EMAIL_START).trim()

    private fun blameByPath(): Map<String, FileBlame> {
        val binaryPaths = binaryPaths()
        val paths = trackedPaths().filterNot { it in binaryPaths }
        val threadPool = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors())
        try {
            val blames = paths.map { path -> threadPool.submit(Callable { blame(path) }) }
            return paths
                .zip(blames)
                .mapNotNull { (path, blame) -> blame.get()?.let { path to it } }
                .toMap()
        } finally {
            threadPool.shutdown()
        }
    }

    private fun trackedPaths(): List<String> = git
        .outputOrNull("ls-tree", "-r", "-z", "HEAD") { output ->
            git
                .nulSeparated(output)
                .map { it.split(TAB, limit = 2) }
                .filter { (modeTypeAndHash, _) -> modeTypeAndHash.split(" ")[1] == BLOB_TYPE }
                .map { (_, path) -> path }
        }.orEmpty()

    private fun binaryPaths(): Set<String> = git
        .numstatOfHead()
        .filter { it.startsWith(BINARY_NUMSTAT_PREFIX) }
        .map { it.removePrefix(BINARY_NUMSTAT_PREFIX) }
        .toSet()

    // Without a revision blame reads the working tree, so a file deleted there fails on its own and lines not yet
    // committed count towards the file's total without belonging to anyone.
    private fun blame(path: String): FileBlame? {
        val ignoreRevisions =
            if (File(repositoryFolder, IGNORE_REVISIONS_FILE).isFile) arrayOf("--ignore-revs-file=$IGNORE_REVISIONS_FILE") else emptyArray()
        val arguments = arrayOf("blame", "--line-porcelain", "-w", "-M") + ignoreRevisions + arrayOf("--", path)
        val blame = git.outputOrNull(*arguments, read = BlameOutput::parse)
        if (blame == null) Logger.warn { "Could not blame $path, so its lines stay without an author." }
        return blame?.takeIf { it.totalLines > 0 }
    }

    companion object {
        const val FLAG = "--author-ownership"
        const val NAMES_FLAG = "--with-author-names"
        const val NEEDS_OWNERSHIP_HINT = "$NAMES_FLAG only adds to author ownership, so it needs $FLAG as well."
        const val REAL_NAMES_WARNING =
            "WARNING: this map contains the REAL NAMES of authors, because of $NAMES_FLAG. They are personal data under GDPR: " +
                "anyone who gets the map can read them. Leave the flag out to get invented names instead."

        fun carriesRealNames(clusters: ClustersLens): Boolean = AuthorOwnershipLens.CLUSTERING_KEY_WITH_NAMES in clusters.clusterings

        const val NEEDS_REPOSITORY_HINT =
            "$FLAG needs the repository to run git blame, which a log file cannot provide. Use 'gitlogparser repo-scan $FLAG' instead."
        const val PERSONAL_DATA_NOTE =
            "Note: the author names in this map are invented, which makes them pseudonymous, not anonymous. " +
                "Anyone with the repository can match them to people, " +
                "so the map may still be personal data under GDPR."
        const val SHALLOW_CLONE_WARNING =
            "Warning: this repository is a shallow clone, so its author names are not stable. Fetch the full history to keep them stable."

        private const val NUL = "\u0000"
        private const val TAB = "\t"
        private const val TRAILER_SEPARATOR = "\u0001"
        private const val EMAIL_START = "<"
        private val CONTACT_WITH_EMAIL = Regex(".+<.+>")
        private const val BLOB_TYPE = "blob"
        private const val BINARY_NUMSTAT_PREFIX = "-\t-\t"
        private const val IGNORE_REVISIONS_FILE = ".git-blame-ignore-revs"
    }
}
