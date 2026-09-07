package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

/**
 * Flattens every `use` declaration into one [ImportDeclaration] per imported leaf.
 *
 * Handles the full use-tree grammar: simple/scoped paths, nested `{...}` lists, globs
 * (`*`), aliases (`as`), and `pub use` re-exports. A `pub use` is tagged [ImportKind.REEXPORT]
 * so the consumer (DependaCharta) can model it as a forwarding node — a crate's public API is
 * commonly flattened via `pub use module::Type`, and consumers then import the short
 * `crate::Type` path. Leading `crate`/`self`/`super` segments are kept verbatim as the first path
 * segment — DC normalizes them against the file's module path, which TSE cannot derive.
 */
internal object ImportExtractor {
    private const val USE_DECLARATION = "use_declaration"
    private const val VISIBILITY_MODIFIER = "visibility_modifier"
    private const val SCOPED_IDENTIFIER = "scoped_identifier"
    private const val IDENTIFIER = "identifier"
    private const val CRATE = "crate"
    private const val SELF = "self"
    private const val SUPER = "super"
    private const val METAVARIABLE = "metavariable"
    private const val USE_WILDCARD = "use_wildcard"
    private const val USE_AS_CLAUSE = "use_as_clause"
    private const val SCOPED_USE_LIST = "scoped_use_list"
    private const val USE_LIST = "use_list"
    private const val SCOPE_SEPARATOR = "::"

    private val PATH_LEAF_TYPES = setOf(SCOPED_IDENTIFIER, IDENTIFIER, CRATE, SELF, SUPER, METAVARIABLE)

    fun extract(rootNode: TSNode, sourceCode: String): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, USE_DECLARATION)
        .flatMap { useDeclaration ->
            val kind = if (useDeclaration.children().any { it.type == VISIBILITY_MODIFIER }) {
                ImportKind.REEXPORT
            } else {
                ImportKind.STANDARD
            }
            val content = useDeclaration.namedChildren().firstOrNull { it.type != VISIBILITY_MODIFIER }
            content?.let { flattenUseTree(it, emptyList(), kind, sourceCode) } ?: emptyList()
        }

    private fun flattenUseTree(node: TSNode, prefix: List<String>, kind: ImportKind, sourceCode: String): List<ImportDeclaration> {
        return when (node.type) {
            in PATH_LEAF_TYPES -> {
                val segments = segmentsOf(node, sourceCode)
                if (segments.isEmpty()) {
                    emptyList()
                } else {
                    listOf(ImportDeclaration(path = prefix + segments, isWildcard = false, kind = kind, bindingName = segments.last()))
                }
            }
            USE_WILDCARD -> {
                val pathNode = node.namedChildren().firstOrNull()
                val segments = pathNode?.let { segmentsOf(it, sourceCode) } ?: emptyList()
                listOf(ImportDeclaration(path = prefix + segments, isWildcard = true, kind = kind))
            }
            USE_AS_CLAUSE -> {
                val children = node.namedChildren().toList()
                val pathNode = children.firstOrNull()
                val aliasNode = children.getOrNull(1)
                val segments = pathNode?.let { segmentsOf(it, sourceCode) } ?: emptyList()
                if (segments.isEmpty()) {
                    emptyList()
                } else {
                    val binding = aliasNode?.let { TreeTraversal.getNodeText(it, sourceCode).trim() } ?: segments.last()
                    listOf(ImportDeclaration(path = prefix + segments, isWildcard = false, kind = kind, bindingName = binding))
                }
            }
            SCOPED_USE_LIST -> {
                val listNode = node.namedChildren().firstOrNull { it.type == USE_LIST } ?: return emptyList()
                val pathNode = node.namedChildren().firstOrNull { it.type != USE_LIST }
                val newPrefix = prefix + (pathNode?.let { segmentsOf(it, sourceCode) } ?: emptyList())
                flattenUseTree(listNode, newPrefix, kind, sourceCode)
            }
            USE_LIST -> node.namedChildren().flatMap { flattenUseTree(it, prefix, kind, sourceCode) }.toList()
            else -> emptyList()
        }
    }

    private fun segmentsOf(node: TSNode, sourceCode: String): List<String> = TreeTraversal
        .getNodeText(node, sourceCode)
        .split(SCOPE_SEPARATOR)
        .map { it.trim() }
        .filter { it.isNotEmpty() }
}
