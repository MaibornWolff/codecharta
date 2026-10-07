package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val FIELD_IDENTIFIER = "field_identifier"

/**
 * Extracts all identifiers from field declaration.
 * Handles both named fields and embedded fields.
 */
internal fun extractAllFieldDeclarationIdentifiers(node: SyntaxNode): List<String> {
    val identifiers = TreeTraversal.findAllChildrenTextByType(
        node,
        FIELD_IDENTIFIER
    )
    if (identifiers.isNotEmpty()) {
        return identifiers
    }
    return listOfNotNull(extractEmbeddedFieldIdentifier(node))
}
