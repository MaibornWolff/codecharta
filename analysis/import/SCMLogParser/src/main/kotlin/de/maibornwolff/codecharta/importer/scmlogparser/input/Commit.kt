package de.maibornwolff.codecharta.importer.scmlogparser.input

import java.time.OffsetDateTime

class Commit(val author: String,  modifications: List<Modification>, val commitDate: OffsetDateTime) {

    val modifications: List<Modification>

    val filenames: List<String>
        get() = modifications.map { it.currentFilename }

    //only the case for error commit
    val isEmpty = modifications.isEmpty()

    init {
        this.modifications = modifications
        //= filterEmptyFiles(modifications)
    }
}
