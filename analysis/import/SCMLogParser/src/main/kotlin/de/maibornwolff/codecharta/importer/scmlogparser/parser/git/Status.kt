package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

/**
 * Git Modification Status
 *
 *
 * see "diff-raw status letters" at https://github.com/git/git/blob/35f6318d44379452d8d33e880d8df0267b4a0cd0/diff.h#L326
 */
internal enum class Status(private val letter: Char) {

    ADDED('A'),
    COPIED('C'),
    DELETED('D'),
    MODIFIED('M'),
    RENAMED('R'),
    TYPE_CHANGED('T'),
    UNKNOWN('X'),
    UNMERGED('U');

    fun toModificationType(): Modification.Type {
        return when (this) {
            ADDED -> Modification.Type.ADD
            DELETED -> Modification.Type.DELETE
            MODIFIED -> Modification.Type.MODIFY
            RENAMED -> Modification.Type.RENAME
            else -> Modification.Type.UNKNOWN
        }
    }

    fun statusLetter(): Char {
        return letter
    }

    companion object {

        val ALL_STATUS_LETTERS: List<Char> = Status.values().map { it.statusLetter() } //sanity check

        fun byCharacter(c: Char): Status {
            return Status.values().firstOrNull { status -> status.letter == c } ?: UNKNOWN
        }
    }
}
