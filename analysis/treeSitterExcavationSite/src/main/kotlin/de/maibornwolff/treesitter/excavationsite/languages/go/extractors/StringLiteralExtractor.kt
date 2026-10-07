package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val IMPORT_DECLARATION = "import_declaration"
private const val IMPORT_SPEC = "import_spec"

/**
 * Extracts non-import interpreted string literals from Go code.
 *
 * Returns null for strings inside import declarations,
 * allowing them to be skipped during extraction.
 */
internal fun extractNonImportInterpretedString(node: SyntaxNode): String? {
    if (isImportString(node)) return null
    val text = node.text
    return text.removeSurrounding("\"")
}

/**
 * Extracts non-import raw string literals from Go code.
 *
 * Returns null for strings inside import declarations.
 */
internal fun extractNonImportRawString(node: SyntaxNode): String? {
    if (isImportString(node)) return null
    val text = node.text
    return StringParser.stripBackticks(text)
}

private fun isImportString(node: SyntaxNode): Boolean = TreeTraversal.hasAncestorOfTypes(node, IMPORT_DECLARATION, IMPORT_SPEC)
