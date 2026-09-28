package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

private const val IMPORT_DECLARATION = "import_declaration"
private const val IMPORT_SPEC = "import_spec"

/**
 * Extracts non-import interpreted string literals from Go code.
 *
 * Returns null for strings inside import declarations,
 * allowing them to be skipped during extraction.
 */
internal fun extractNonImportInterpretedString(node: TSNode, sourceCode: String): String? {
    if (isImportString(node)) return null
    val text = TreeTraversal.getNodeText(node, sourceCode)
    return text.removeSurrounding("\"")
}

/**
 * Extracts non-import raw string literals from Go code.
 *
 * Returns null for strings inside import declarations.
 */
internal fun extractNonImportRawString(node: TSNode, sourceCode: String): String? {
    if (isImportString(node)) return null
    val text = TreeTraversal.getNodeText(node, sourceCode)
    return StringParser.stripBackticks(text)
}

private fun isImportString(node: TSNode): Boolean = TreeTraversal.hasAncestorOfTypes(node, IMPORT_DECLARATION, IMPORT_SPEC)
