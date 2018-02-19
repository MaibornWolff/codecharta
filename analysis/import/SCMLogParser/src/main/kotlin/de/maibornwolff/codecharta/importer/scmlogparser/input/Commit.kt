package de.maibornwolff.codecharta.importer.scmlogparser.input

import java.time.OffsetDateTime

class Commit(val author: String, modifications: List<Modification>, val commitDate: OffsetDateTime) {

    val modifications: List<Modification>

    val filenames: List<String>
        get() = modifications.map { it.filename }

    val isEmpty: Boolean
        get() = modifications.isEmpty()

    init {
        this.modifications = filterEmptyFiles(modifications)
    }

    private fun filterEmptyFiles(modifications: List<Modification>): List<Modification> {
        return modifications
                .filter { !it.filename.isEmpty() }
    }

    fun getModification(filename: String): List<Modification> {
        // we assume that in one commit there is only one modification for a file.
        return modifications.filter { filename == it.filename }
    }
}
