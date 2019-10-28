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

    fun getModification(filename: String): Modification {
        val modifications = modifications.filter { filename == it.filename }
        if (modifications.isEmpty()) {
            throw IllegalStateException("File $filename could not be assigned to a modification.")
        } else if (modifications.size > 1) {
            System.err.println("No unique file name was found in commit for $filename, ${modifications.size} files were found")
            System.err.println("This likely means that the Syntax of this commit is broken.")
        }
        return modifications.first()
    }
}
