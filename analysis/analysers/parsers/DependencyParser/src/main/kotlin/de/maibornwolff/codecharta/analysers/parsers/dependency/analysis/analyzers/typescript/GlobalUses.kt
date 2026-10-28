package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_GLOBAL_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import java.io.File

/**
 * The uses of a name no module binding binds, which TSE marks global, by rules 3 to 5 of "A simple name" in
 * `docs/name-resolution/typescript.md`: each global declaration of the project of that name (decision 9); else a
 * global of the runtime, no use, unless the name is upper case, which stays as written for the rules after.
 */
internal object GlobalUses {
    private const val SEPARATOR = "."

    fun of(usedTypes: Set<UsedType>, analysisRoot: File?): Set<UsedType> = usedTypes.flatMapTo(LinkedHashSet()) { usedType ->
        if (usedType.namespacePrefix == listOf(TSE_GLOBAL_SEGMENT)) globalsOf(usedType, analysisRoot) else listOf(usedType)
    }

    private fun globalsOf(usedType: UsedType, analysisRoot: File?): List<UsedType> {
        val segments = usedType.name.split(SEPARATOR)
        val paths = analysisRoot?.let { GlobalDeclarations.of(it).pathsOf(segments.first()) }.orEmpty()
        if (paths.isNotEmpty()) {
            return paths.map {
                usedType.copy(
                    name = (it + Path(segments.drop(1))).withDots(),
                    namespacePrefix = emptyList()
                )
            }
        }
        val isUpperCase = usedType.name.firstOrNull()?.isUpperCase() == true
        return if (isUpperCase) listOf(usedType.copy(namespacePrefix = emptyList())) else emptyList()
    }
}
