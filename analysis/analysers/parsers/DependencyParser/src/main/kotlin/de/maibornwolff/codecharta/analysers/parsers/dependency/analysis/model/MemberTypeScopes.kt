package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

/**
 * The types whose member types a simple name means before any import or package (rule 3 of
 * `docs/name-resolution/java.md` and `kotlin.md`): the own type, its supertypes, then each enclosing type outwards.
 */
internal class MemberTypeScopes(
    private val ownPath: Path,
    private val scopes: List<Path>,
    private val projectDictionary: Map<String, List<Path>>
) {
    fun isOwnName(name: String): Boolean = ownPath.parts.lastOrNull() == name

    fun memberNamed(name: String): Path? {
        val candidates = projectDictionary[name] ?: return null
        return scopes.firstNotNullOfOrNull { scope -> candidates.find { it.withoutName() == scope.parts } }
    }

    companion object {
        val NONE = MemberTypeScopes(Path(emptyList()), emptyList(), emptyMap())

        fun of(
            ownPath: Path,
            supertypes: List<Path>,
            internalNodePaths: Set<String>,
            projectDictionary: Map<String, List<Path>>
        ): MemberTypeScopes =
            MemberTypeScopes(ownPath, listOf(ownPath) + supertypes + enclosingTypesOf(ownPath, internalNodePaths), projectDictionary)

        private fun enclosingTypesOf(path: Path, internalNodePaths: Set<String>): List<Path> = (path.parts.size - 1 downTo 1)
            .map { length -> Path(path.parts.take(length)) }
            .filter { it.withDots() in internalNodePaths }
    }
}
