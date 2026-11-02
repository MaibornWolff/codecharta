package de.maibornwolff.codecharta.analysers.parsers.gitlog.commitchanges

/** [changedLines] is null where git counts no lines, as for a binary file. */
internal data class FileChange(val path: String, val changedLines: Int?, val pathBefore: String? = null)

internal data class LoggedCommit(val hash: String, val committedAtEpochSecond: Long, val subject: String, val changes: List<FileChange>)

/** Reads `git log --numstat -z` written with [FORMAT]. */
internal object CommitLogOutput {
    const val FORMAT = "--format=%x02%H%x00%ct%x00%s%x00"

    private const val COMMIT_START = "\u0002"
    private const val NUL = "\u0000"
    private const val TAB = "\t"
    private const val BINARY_COUNT = "-"
    private const val HEADER_FIELD_COUNT = 3
    private const val NUMSTAT_FIELD_COUNT = 3

    fun parse(output: String): List<LoggedCommit> = output.split(COMMIT_START).filter { it.isNotEmpty() }.map(::commitOf)

    private fun commitOf(record: String): LoggedCommit {
        val fields = record.split(NUL)
        val (hash, committedAt, subject) = fields
        val numstat = fields.drop(HEADER_FIELD_COUNT).map { it.trimStart('\n') }.filter { it.isNotEmpty() }
        return LoggedCommit(hash, committedAt.toLong(), subject, changesOf(numstat))
    }

    // A rename leaves its path field empty and follows with the old and the new path as two fields of their own
    private fun changesOf(numstat: List<String>): List<FileChange> {
        val changes = mutableListOf<FileChange>()
        val fields = numstat.iterator()
        while (fields.hasNext()) {
            val (added, removed, path) = fields.next().split(TAB, limit = NUMSTAT_FIELD_COUNT)
            val changedLines = changedLinesOf(added, removed)
            if (path.isEmpty()) {
                val pathBefore = fields.next()
                changes.add(FileChange(fields.next(), changedLines, pathBefore))
            } else {
                changes.add(FileChange(path, changedLines))
            }
        }
        return changes
    }

    private fun changedLinesOf(added: String, removed: String): Int? =
        if (added == BINARY_COUNT || removed == BINARY_COUNT) null else added.toInt() + removed.toInt()
}
