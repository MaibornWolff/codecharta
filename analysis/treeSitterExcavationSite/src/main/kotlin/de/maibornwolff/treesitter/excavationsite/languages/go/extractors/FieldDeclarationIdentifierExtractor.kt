package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val FIELD_IDENTIFIER = "field_identifier"

/**
 * Extracts first identifier from field declaration.
 * Handles both named fields and embedded fields.
 */
internal fun extractFieldDeclarationIdentifier(node: TSNode, sourceCode: String): String? {
    TreeTraversal
        .findFirstChildTextByType(node, sourceCode, FIELD_IDENTIFIER)
        ?.let { return it }
    return extractEmbeddedFieldIdentifier(node, sourceCode)
}
