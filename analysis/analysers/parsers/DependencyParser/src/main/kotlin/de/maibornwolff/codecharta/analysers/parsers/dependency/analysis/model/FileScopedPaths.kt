package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

/** The logical paths that only file-scoped declarations declare, each with the files that may name it. */
class FileScopedPaths(private val filesByPath: Map<String, Set<String>>) {
    fun isVisible(path: Path, fromFile: String): Boolean = filesByPath[path.withDots()]?.contains(fromFile) ?: true

    companion object {
        val NONE = FileScopedPaths(emptyMap())
    }
}
