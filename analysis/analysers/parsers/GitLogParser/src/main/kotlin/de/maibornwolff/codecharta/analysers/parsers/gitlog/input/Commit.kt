package de.maibornwolff.codecharta.analysers.parsers.gitlog.input

import java.time.OffsetDateTime

class Commit(
    val author: String,
    val modifications: List<Modification>,
    val commitDate: OffsetDateTime,
    private val mergeCommit: Boolean = false,
    val message: String = "",
    val coAuthors: List<String> = emptyList()
) {
    val fileNameList: List<String>
        get() = modifications.map { it.currentFilename }

    val isEmpty = modifications.isEmpty()

    fun isMergeCommit(): Boolean {
        return mergeCommit
    }
}
