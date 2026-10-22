package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/** The used types with each import alias in front of a name replaced by the full path the alias stands for. */
internal object ImportAliases {
    private const val PACKAGE_SEPARATOR = "."

    fun resolve(usedTypes: Set<UsedType>, imports: List<ImportDeclaration>): Set<UsedType> {
        val importedPathByAlias = imports
            .mapNotNull { import -> import.bindingName?.let { alias -> alias to import.path.joinToString(PACKAGE_SEPARATOR) } }
            .toMap()
        return usedTypes.map { it.withAliasesResolved(importedPathByAlias) }.toSet()
    }

    // The full path, not only its last segment, as an alias often exists because another import shares that name
    private fun UsedType.withAliasesResolved(importedPathByAlias: Map<String, String>): UsedType = copy(
        name = nameWithAliasResolved(importedPathByAlias),
        genericTypes = genericTypes.map { it.withAliasesResolved(importedPathByAlias) }
    )

    private fun UsedType.nameWithAliasResolved(importedPathByAlias: Map<String, String>): String {
        val qualifier = name.substringBefore(PACKAGE_SEPARATOR)
        val importedPath = importedPathByAlias[qualifier] ?: return name
        return importedPath + name.removePrefix(qualifier)
    }
}
