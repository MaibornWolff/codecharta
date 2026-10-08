package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The paths the `use` declarations import, then the files the file includes, then the imported constants. An include
 * is [ImportKind.INCLUDE] with its path split at slashes and backslashes, for the consumer to resolve. Only a
 * single-quoted path directly behind the keyword counts: one in double quotes, in parentheses or computed is no
 * import.
 */
internal object ImportExtractor {
    private const val STRING = "string"
    private const val PATH_SEPARATOR = "/"
    private val INCLUDE_EXPRESSIONS =
        setOf("require_once_expression", "require_expression", "include_once_expression", "include_expression")

    fun extract(rootNode: SyntaxNode): List<ImportDeclaration> {
        val (useDeclarations, includeExpressions) = TreeTraversal
            .findAllDescendantsOfType(rootNode, NamespaceUses.NAMESPACE_USE_DECLARATION, *INCLUDE_EXPRESSIONS.toTypedArray())
            .partition { it.type == NamespaceUses.NAMESPACE_USE_DECLARATION }
        val includes = includeExpressions.flatMap { TreeTraversal.findAllChildrenTextByType(it, STRING) }.map { toInclude(it) }
        return NamespaceUses.importedPaths(useDeclarations).map { toImport(it) } +
            includes +
            NamespaceUses.constantPaths(useDeclarations).map { toImport(it) }
    }

    private fun toImport(path: List<String>) = ImportDeclaration(path = path, isWildcard = false)

    private fun toInclude(quotedPath: String): ImportDeclaration {
        val path = quotedPath.replace(NamespaceUses.NAMESPACE_SEPARATOR, PATH_SEPARATOR).withoutQuotes()
        return ImportDeclaration(path = path.split(PATH_SEPARATOR), isWildcard = false, kind = ImportKind.INCLUDE)
    }
}
