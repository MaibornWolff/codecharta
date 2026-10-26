package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/** The paths the `use` declarations import, then the imported constants. An include is a use, see [IncludePaths]. */
internal object ImportExtractor {
    fun extract(rootNode: SyntaxNode): List<ImportDeclaration> {
        val useDeclarations = TreeTraversal.findAllDescendantsOfType(rootNode, NamespaceUses.NAMESPACE_USE_DECLARATION)
        return (NamespaceUses.importedPaths(useDeclarations) + NamespaceUses.constantPaths(useDeclarations)).map { toImport(it) }
    }

    private fun toImport(path: List<String>) = ImportDeclaration(path = path, isWildcard = false)
}
