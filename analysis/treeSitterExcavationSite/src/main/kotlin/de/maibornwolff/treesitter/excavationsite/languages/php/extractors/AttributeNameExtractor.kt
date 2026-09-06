package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val NAME = "name"
private const val QUALIFIED_NAME = "qualified_name"

/**
 * Extracts attribute name from attribute node.
 * Handles both simple names and qualified names: `#[Route]` or `#[App\Route]`
 */
internal fun extractAttributeName(node: TSNode, sourceCode: String): String? {
    for (child in node.children()) {
        if (child.type == NAME) {
            return TreeTraversal.getNodeText(child, sourceCode)
        }
        if (child.type == QUALIFIED_NAME) {
            return findLastNameChild(child, sourceCode)
        }
    }
    return null
}
