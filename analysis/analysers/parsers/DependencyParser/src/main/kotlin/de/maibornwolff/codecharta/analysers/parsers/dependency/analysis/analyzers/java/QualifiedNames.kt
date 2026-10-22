package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.MemberTypeScopes
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path

/**
 * A qualified name `Q.N` of Java or Kotlin: through a type when the first segment resolves as one by the simple-name
 * rules, else through a package. It means the deepest project declaration it reaches; a member below that which no
 * declaration is (`Node.build`, `Outer.CONSTANT`) is an extension of that name found by the simple-name rules, or else
 * a use of the declaration. A name outside the project reaches none and stays outside.
 */
internal class QualifiedNames(
    private val resolveSimpleName: (String) -> Path,
    private val resolveOwnName: (String) -> Path,
    private val memberTypes: MemberTypeScopes,
    private val internalNodePaths: Set<String>
) {
    fun resolve(name: String): Path {
        val segments = name.split(SEPARATOR)
        val qualifier = typeNamed(segments.first())
        val written = if (qualifier != null) Path(qualifier.parts + segments.drop(1)) else Path(segments)
        val deepest = deepestDeclaration(written) ?: return written
        if (deepest.parts.size == written.parts.size) return deepest
        return extensionNamed(written.parts[deepest.parts.size]) ?: deepest
    }

    private fun extensionNamed(member: String): Path? = resolveSimpleName(member).takeIf { it.withDots() in internalNodePaths }

    private fun typeNamed(name: String): Path? {
        val path = if (memberTypes.isOwnName(name)) resolveOwnName(name) else memberTypes.memberNamed(name) ?: resolveSimpleName(name)
        return path.takeUnless { it.isUnknown() }
    }

    private fun deepestDeclaration(path: Path): Path? = (path.parts.size downTo 1)
        .map { length -> Path(path.parts.take(length)) }
        .firstOrNull { it.withDots() in internalNodePaths }

    companion object {
        private const val SEPARATOR = "."
    }
}
