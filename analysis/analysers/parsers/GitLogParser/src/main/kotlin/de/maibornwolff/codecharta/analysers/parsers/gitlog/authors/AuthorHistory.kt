package de.maibornwolff.codecharta.analysers.parsers.gitlog.authors

import de.maibornwolff.codecharta.analysers.parsers.gitlog.util.GitCommand
import java.io.File

/** A commit's author and co-authors, the author first. */
internal data class CommitPeople(val hash: String, val people: List<String>)

/** Reads who made each commit of the repository's history, with the mailmap applied, and reads it only once. */
class AuthorHistory(repositoryFolder: File) {
    private val git = GitCommand(repositoryFolder)

    internal val commitsOldestFirst: List<CommitPeople> by lazy { readCommitsOldestFirst() }

    private fun readCommitsOldestFirst(): List<CommitPeople> {
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

    companion object {
        private const val NUL = "\u0000"
        private const val TRAILER_SEPARATOR = "\u0001"
        private const val EMAIL_START = "<"
        private val CONTACT_WITH_EMAIL = Regex(".+<.+>")
    }
}
