package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames

/**
 * Attributes of `csharp.md`: `[Name]` means whichever of `Name` and `NameAttribute` is an attribute class, one that
 * names `Attribute` in its base list directly or through a project class; else `NameAttribute`, as compiling code
 * has at most one attribute class of the two.
 */
internal class CSharpAttributes(private val project: ProjectNames) {
    fun choose(plain: Path, suffixed: Path): Path {
        val inProject = listOf(plain, suffixed).filter { it.withDots() in project.internalNodePaths }
        if (inProject.size < 2) return inProject.singleOrNull() ?: suffixed.takeUnless { it.isUnknown() } ?: plain
        return if (isAttributeClass(plain.withDots()) && !isAttributeClass(suffixed.withDots())) plain else suffixed
    }

    private fun isAttributeClass(path: String, visited: Set<String> = emptySet()): Boolean =
        project.baseTypeNames[path].orEmpty().any { baseName ->
            val simpleName = baseName.substringAfterLast(QUALIFIER_SEPARATOR)
            simpleName == ATTRIBUTE_BASE ||
                project.projectDictionary[simpleName].orEmpty().map { it.withDots() }.any {
                    it !in visited && isAttributeClass(it, visited + path)
                }
        }

    companion object {
        private const val ATTRIBUTE_BASE = "Attribute"
        private const val QUALIFIER_SEPARATOR = "."
    }
}
