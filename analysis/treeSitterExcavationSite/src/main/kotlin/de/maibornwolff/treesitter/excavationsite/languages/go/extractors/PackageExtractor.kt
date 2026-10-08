package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The names of all package clauses of the file, not a path: the import path of a Go package follows its directory,
 * which only the consumer knows.
 */
internal object PackageExtractor {
    private const val PACKAGE_CLAUSE = "package_clause"
    private const val PACKAGE_IDENTIFIER = "package_identifier"

    fun extract(rootNode: SyntaxNode): List<String> = TreeTraversal
        .findAllDescendantsOfType(rootNode, PACKAGE_CLAUSE)
        .mapNotNull { packageClause -> TreeTraversal.findAllDescendantsOfType(packageClause, PACKAGE_IDENTIFIER).firstOrNull()?.text }
}
