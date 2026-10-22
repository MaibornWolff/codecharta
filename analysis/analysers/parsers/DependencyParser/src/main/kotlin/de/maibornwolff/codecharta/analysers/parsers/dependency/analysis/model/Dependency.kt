package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

/** @property scope where an import is written, as the namespace around a C# using; null for a language without one */
data class Dependency(
    val path: Path,
    val isWildcard: Boolean = false,
    val isDotImport: Boolean = false,
    val type: TypeOfUsage = TypeOfUsage.USAGE,
    val scope: List<String>? = null
) {
    companion object {
        fun asWildcard(vararg partOfName: String) = Dependency(Path(partOfName.toList()), isWildcard = true)

        fun asWildcard(partOfName: List<String>) = Dependency(Path(partOfName), isWildcard = true)

        fun simple(vararg partOfName: String) = Dependency(Path(partOfName.toList()))

        fun simpleFromPhysicalPath(physicalPath: String) = Dependency(Path.fromPhysicalPath(physicalPath))
    }

    fun withDots() = path.withDots() + if (isWildcard) ".*" else ""
}
