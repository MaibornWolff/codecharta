package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import de.maibornwolff.codecharta.model.ClustersLens
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.io.InputStream
import java.util.concurrent.Callable
import java.util.concurrent.Executors

/** Measures who made the commits that last changed the lines each file holds today, and numbers them by their first commit. */
class AuthorOwnershipScan(private val repositoryFolder: File) {
    fun lens(): ClustersLens = AuthorOwnershipLens.of(commitsOldestFirst(), blameByPath())

    fun isShallowClone(): Boolean = gitOrNull("rev-parse", "--is-shallow-repository") { it.bufferedReader().readText().trim() } == "true"

    private fun commitsOldestFirst(): List<CommitPeople> {
        val format = "--format=%H%x00%aN%x00%(trailers:key=Co-authored-by,valueonly,separator=%x01)"
        val rows = gitOrNull("-c", "i18n.logOutputEncoding=UTF-8", "log", "--reverse", "--topo-order", format) { output ->
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
            val mapped = gitOrNull("check-mailmap", "--stdin", input = input) { it.bufferedReader(Charsets.UTF_8).readLines() }
            val contacts = if (mapped?.size == withEmail.size) withEmail.zip(mapped).toMap() else emptyMap()
            return coAuthors.associateWith { nameOf(contacts[it] ?: it) }
        } finally {
            input.delete()
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

    private fun trackedPaths(): List<String> = gitOrNull("ls-tree", "-r", "-z", "HEAD") { output ->
        nulSeparated(output)
            .map { it.split(TAB, limit = 2) }
            .filter { (modeTypeAndHash, _) -> modeTypeAndHash.split(" ")[1] == BLOB_TYPE }
            .map { (_, path) -> path }
    }.orEmpty()

    private fun binaryPaths(): Set<String> {
        val emptyTree = gitOrNull("hash-object", "-t", "tree", "--stdin") { it.bufferedReader().readText().trim() } ?: return emptySet()
        return gitOrNull("diff", "--numstat", "-z", "--no-renames", "--relative", emptyTree, "HEAD") { output ->
            nulSeparated(output)
                .filter { it.startsWith(BINARY_NUMSTAT_PREFIX) }
                .map { it.removePrefix(BINARY_NUMSTAT_PREFIX) }
                .toSet()
        }.orEmpty()
    }

    private fun nulSeparated(output: InputStream): List<String> =
        output.readBytes().toString(Charsets.UTF_8).split(NUL).filter { it.isNotEmpty() }

    // Without a revision blame reads the working tree, so a file deleted there fails on its own and lines not yet
    // committed count towards the file's total without belonging to anyone.
    private fun blame(path: String): FileBlame? {
        val ignoreRevisions =
            if (File(repositoryFolder, IGNORE_REVISIONS_FILE).isFile) arrayOf("--ignore-revs-file=$IGNORE_REVISIONS_FILE") else emptyArray()
        val arguments = arrayOf("blame", "--line-porcelain", "-w", "-M") + ignoreRevisions + arrayOf("--", path)
        val blame = gitOrNull(*arguments, read = BlameOutput::parse)
        if (blame == null) Logger.warn { "Could not blame $path, so its lines stay without an author." }
        return blame?.takeIf { it.totalLines > 0 }
    }

    private fun <T> gitOrNull(vararg arguments: String, input: File = EMPTY_INPUT, read: (InputStream) -> T): T? {
        val process = ProcessBuilder(listOf("git") + arguments)
            .directory(repositoryFolder)
            .redirectInput(ProcessBuilder.Redirect.from(input))
            .redirectError(ProcessBuilder.Redirect.DISCARD)
            .start()
        val result = process.inputStream.use(read)
        return result.takeIf { process.waitFor() == 0 }
    }

    companion object {
        const val FLAG = "--author-ownership"
        const val NEEDS_REPOSITORY_HINT =
            "$FLAG needs the repository to run git blame, which a log file cannot provide. Use 'gitlogparser repo-scan $FLAG' instead."
        const val PERSONAL_DATA_NOTE =
            "Note: the author numbers in this map are pseudonymous. Anyone with the repository can match them to people, " +
                "so the map may still be personal data under GDPR."
        const val SHALLOW_CLONE_WARNING =
            "Warning: this repository is a shallow clone, so its author numbers are not stable. Fetch the full history to keep them stable."

        private const val NUL = "\u0000"
        private const val TAB = "\t"
        private const val TRAILER_SEPARATOR = "\u0001"
        private const val EMAIL_START = "<"
        private val CONTACT_WITH_EMAIL = Regex(".+<.+>")
        private const val BLOB_TYPE = "blob"
        private const val BINARY_NUMSTAT_PREFIX = "-\t-\t"
        private const val IGNORE_REVISIONS_FILE = ".git-blame-ignore-revs"
        private val EMPTY_INPUT = File(if (System.getProperty("os.name").startsWith("Windows")) "NUL" else "/dev/null")
    }
}
