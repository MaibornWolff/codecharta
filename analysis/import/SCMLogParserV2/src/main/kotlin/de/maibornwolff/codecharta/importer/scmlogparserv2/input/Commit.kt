package de.maibornwolff.codecharta.importer.scmlogparserv2.input

import java.time.OffsetDateTime

class Commit(
    val author: String,
    modifications: List<Modification>,
    val commitDate: OffsetDateTime,
    private val mergeCommit: Boolean = false
) {

    val modifications: List<Modification>

    val fileNameList: List<String>
        get() = modifications.map { it.currentFilename }

    val isEmpty = modifications.isEmpty()

    init {
        this.modifications = modifications
    }

    fun isMergeCommit(): Boolean {
        return mergeCommit
    }
}
