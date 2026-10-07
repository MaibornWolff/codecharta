package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

/**
 * Extracts decorator name: handles simple, call, and attribute decorators.
 * `@dataclass` -> "dataclass"
 * `@decorator(arg)` -> "decorator"
 * `@module.decorator` -> "decorator"
 */
internal fun extractDecoratorName(node: SyntaxNode, sourceCode: String, findFirstIdentifier: (SyntaxNode, String) -> String?): String? {
    for (child in node.children()) {
        val result = extractDecoratorNameFromChild(child, sourceCode, findFirstIdentifier)
        if (result != null) return result
    }
    return null
}

private fun extractDecoratorNameFromChild(
    child: SyntaxNode,
    sourceCode: String,
    findFirstIdentifier: (SyntaxNode, String) -> String?
): String? = when (child.type) {
    "identifier" -> TreeTraversal.getNodeText(child, sourceCode)
    "call" -> extractDecoratorNameFromCall(child, sourceCode, findFirstIdentifier)
    "attribute" -> findFirstIdentifier(child, sourceCode)
    else -> null
}

private fun extractDecoratorNameFromCall(
    callNode: SyntaxNode,
    sourceCode: String,
    findFirstIdentifier: (SyntaxNode, String) -> String?
): String? {
    val func = callNode.children().firstOrNull() ?: return null
    return when (func.type) {
        "identifier" -> TreeTraversal.getNodeText(func, sourceCode)
        "attribute" -> findFirstIdentifier(func, sourceCode)
        else -> null
    }
}
