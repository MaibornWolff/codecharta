package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val NAME = "name"
private const val QUALIFIED_NAME = "qualified_name"

/**
 * Extracts attribute name from attribute node.
 * Handles both simple names and qualified names: `#[Route]` or `#[App\Route]`
 */
internal fun extractAttributeName(node: SyntaxNode): String? {
    for (child in node.children()) {
        if (child.type == NAME) {
            return child.text
        }
        if (child.type == QUALIFIED_NAME) {
            return findLastNameChild(child)
        }
    }
    return null
}
