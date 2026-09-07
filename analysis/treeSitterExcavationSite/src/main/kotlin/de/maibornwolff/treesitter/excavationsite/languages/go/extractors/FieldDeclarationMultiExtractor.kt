package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val FIELD_IDENTIFIER = "field_identifier"

/**
 * Extracts all identifiers from field declaration.
 * Handles both named fields and embedded fields.
 */
internal fun extractAllFieldDeclarationIdentifiers(node: TSNode, sourceCode: String): List<String> {
    val identifiers = TreeTraversal.findAllChildrenTextByType(
        node,
        sourceCode,
        FIELD_IDENTIFIER
    )
    if (identifiers.isNotEmpty()) {
        return identifiers
    }
    return listOfNotNull(extractEmbeddedFieldIdentifier(node, sourceCode))
}
