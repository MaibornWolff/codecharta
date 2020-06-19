package de.maibornwolff.codecharta.importer.scmlogparser.parser.svn

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

/**
 * SVN Modification Status
 *
 *
 * see "action" char at http://svn.apache.org/viewvc/subversion/trunk/subversion/include/svn_types.h?view=markup&pathrev=1751399#l835
 */
internal enum class Status(private val letter: Char) {

    ADD('A'),
    DELETE('D'),
    MODIFY('M'),
    REPLACE('R');

    fun statusLetter(): Char {
        return letter
    }

    fun toModificationType(): Modification.Type {
        return when (this) {
            Status.ADD -> Modification.Type.ADD
            Status.DELETE -> Modification.Type.DELETE
            Status.MODIFY -> Modification.Type.MODIFY
            Status.REPLACE -> Modification.Type.UNKNOWN
        }
    }

    companion object {

        val ALL_STATUS_LETTERS: List<Char> = Status.values().map { it.statusLetter() }

        fun byCharacter(c: Char): Status {
            return Status.values().first { status -> status.letter == c }
        }
    }
}
