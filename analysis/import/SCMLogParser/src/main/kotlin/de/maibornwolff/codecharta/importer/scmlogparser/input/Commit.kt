package de.maibornwolff.codecharta.importer.scmlogparser.input

import java.time.OffsetDateTime

class Commit(val author: String, modifications: List<Modification>, val commitDate: OffsetDateTime) {

    val modifications: List<Modification>

    //TODO extra work due to getter, maybe change
    val filenames: List<String>
        get() = modifications.map { it.currentFilename }

    //only the case for error commit
    val isEmpty = modifications.isEmpty()

    init {
        this.modifications = modifications
        //= filterEmptyFiles(modifications)
    }

 /*   //TODO no longer possible currentFilename refers to the current and not (likely previously) old filename
    private fun filterEmptyFiles(modifications: List<Modification>): List<Modification> {
        return modifications
                .filter { !it.currentFilename.isEmpty() }
    }
*/
    fun getModificationForFilename(filename: String): Modification {

     var modificationsForFilename = this.modifications.first { filename == it.currentFilename }
/*
        val modifications2 = modifications.filter {
            if(it.type == Modification.Type.RENAME) filename == it.oldFilename
            else filename == it.currentFilename
        }
        */
/*
     //TODO can not be empty after logic change
        if (modificationsForFilename.isEmpty()) {
            throw IllegalStateException("File $filename could not be assigned to a modification $modificationsForFilename")
        }
        //TODO this could be handled in LogLineParser
        else if (modificationsForFilename.size > 1) {
            System.err.println("No unique file name was found in commit for $filename, ${modificationsForFilename.size} files were found")
            System.err.println("This likely means that the Syntax of this commit is broken.")
        }
        */
        return modificationsForFilename
    }
}
