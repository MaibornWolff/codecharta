package de.maibornwolff.codecharta.analysers.parsers.gitlog.input

class Modification(
    val currentFilename: String,
    val oldFilename: String,
    val additions: Long,
    val deletions: Long,
    val type: Type
) {
    private var initialAdd = false

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

    fun isTypeDelete(): Boolean = type == Type.DELETE

    fun isTypeAdd(): Boolean = type == Type.ADD

    fun isTypeModify(): Boolean = type == Type.MODIFY

    fun isTypeRename(): Boolean = type == Type.RENAME

    fun getTrackName(): String = if (oldFilename.isNotEmpty()) oldFilename else currentFilename

    fun markInitialAdd() {
        initialAdd = true
    }

    fun isInitialAdd(): Boolean = initialAdd

    companion object {
        val EMPTY = Modification("")
    }
}
