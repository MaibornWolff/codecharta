package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

/**
 * Which of the files that declare one logical path a dependency on it points at: a rule of the using file's language,
 * [NearestCopy] unless the language's own rules next to its analyzer say otherwise.
 */
fun interface CopyRules {
    /** The files a use in [usingFile] points at among the [copies] it can see, in scan order; at least one. */
    fun filesFor(copies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath>
}

/** A file that declares a logical path; a file-scoped copy only its own file can name. */
data class DeclaringCopy(val file: FilePath, val isFileScoped: Boolean)

/** Shared rule 2 of `docs/name-resolution/README.md`: the file sharing the longest folder path, the first of equally near. */
object NearestCopy : CopyRules {
    override fun filesFor(copies: List<DeclaringCopy>, usingFile: FilePath): List<FilePath> =
        listOf(copies.maxBy { sharedFolderCount(it.file, usingFile) }.file)

    private fun sharedFolderCount(declaringFile: FilePath, usingFile: FilePath): Int = declaringFile.segments
        .dropLast(1)
        .zip(usingFile.segments.dropLast(1))
        .takeWhile { (first, second) -> first == second }
        .size
}
