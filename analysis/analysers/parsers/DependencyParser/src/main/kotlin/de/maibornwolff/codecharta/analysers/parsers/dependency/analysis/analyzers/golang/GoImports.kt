package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * The names the imports of one Go file bind to project packages, by "Import paths" of `docs/name-resolution/go.md`:
 * the alias, else the name in the package clause of the imported package. A blank import binds no name, a dot import
 * adds the package's names to the file instead, and a library package binds no name a project declaration lies under.
 */
internal class GoImports(
    imports: List<ImportDeclaration>,
    folderOf: (ImportDeclaration) -> List<String>?,
    packageNameOf: (List<String>) -> String?
) {
    private val folderByName: Map<String, List<String>> = imports
        .filter { !it.isWildcard && it.bindingName != BLANK_IDENTIFIER }
        .mapNotNull { import -> folderOf(import)?.let { folder -> (import.bindingName ?: packageNameOf(folder))?.let { it to folder } } }
        .toMap()

    /**
     * The name the name rules look up: a selector through an import name as the full path of the declaration, a simple
     * name as written; null for a selector on a value or through a library package, which names no project declaration.
     */
    fun nameOf(usedType: UsedType): String? {
        val qualifier = usedType.namespacePrefix.singleOrNull() ?: usedType.name.substringBefore(SELECTOR, "").ifEmpty { null }
        if (qualifier == null) return usedType.name
        val folder = folderByName[qualifier] ?: return null
        return Path(folder + usedType.name.substringAfter(SELECTOR)).withDots()
    }

    companion object {
        private const val BLANK_IDENTIFIER = "_"
        private const val SELECTOR = "."
    }
}
