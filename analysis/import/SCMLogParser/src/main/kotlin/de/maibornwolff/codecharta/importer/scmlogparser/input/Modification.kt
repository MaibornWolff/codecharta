package de.maibornwolff.codecharta.importer.scmlogparser.input

class Modification(
    val filename: String,
    val oldFilename: String,
    val additions: Long,
    val deletions: Long,
    val type: Type
) {

    constructor(filename: String, type: Type) : this(filename, 0, 0, type)

    constructor(filename: String, oldFilename: String, type: Type) : this(filename, oldFilename, 0, 0, type)

    @JvmOverloads
    constructor(filename: String, additions: Long = 0, deletions: Long = 0, type: Type = Type.UNKNOWN) : this(
        filename,
        "",
        additions,
        deletions,
        type
    )

    enum class Type {
        ADD,
        DELETE,
        MODIFY,
        RENAME,
        UNKNOWN
    }

    companion object {
        val EMPTY = Modification("")
    }
}
