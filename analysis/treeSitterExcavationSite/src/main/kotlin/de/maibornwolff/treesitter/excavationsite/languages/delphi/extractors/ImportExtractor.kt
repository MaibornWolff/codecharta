package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts `uses` clauses from a Delphi file.
 *
 * Uses clauses appear in:
 *   - unit `interface` sections
 *   - unit `implementation` sections
 *   - `program` and `library` files
 *
 * Pascal has no wildcard imports; `isWildcard` is always false.
 *
 * A module can appear in both the interface and implementation uses clauses
 * of the same file; duplicates are filtered.
 */
internal object ImportExtractor {
    private const val DECL_USES = "declUses"
    private const val MODULE_NAME = "moduleName"
    private const val IDENTIFIER = "identifier"

    fun extract(rootNode: TSNode, sourceCode: String): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, DECL_USES)
        .flatMap { usesNode ->
            usesNode.children().filter { it.type == MODULE_NAME }.mapNotNull { moduleNode ->
                val path = moduleNode
                    .children()
                    .filter { it.type == IDENTIFIER }
                    .map { TreeTraversal.getNodeText(it, sourceCode) }
                    .toList()
                if (path.isEmpty()) null else ImportDeclaration(path = path, isWildcard = false)
            }
        }.distinct()
}
