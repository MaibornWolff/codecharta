package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Extracts decorator name: handles simple, call, and attribute decorators.
 * `@dataclass` -> "dataclass"
 * `@decorator(arg)` -> "decorator"
 * `@module.decorator` -> "decorator"
 */
internal fun extractDecoratorName(node: SyntaxNode, findFirstIdentifier: (SyntaxNode) -> String?): String? {
    for (child in node.children()) {
        val result = extractDecoratorNameFromChild(child, findFirstIdentifier)
        if (result != null) return result
    }
    return null
}

private fun extractDecoratorNameFromChild(child: SyntaxNode, findFirstIdentifier: (SyntaxNode) -> String?): String? = when (child.type) {
    "identifier" -> child.text
    "call" -> extractDecoratorNameFromCall(child, findFirstIdentifier)
    "attribute" -> findFirstIdentifier(child)
    else -> null
}

private fun extractDecoratorNameFromCall(callNode: SyntaxNode, findFirstIdentifier: (SyntaxNode) -> String?): String? {
    val func = callNode.children().firstOrNull() ?: return null
    return when (func.type) {
        "identifier" -> func.text
        "attribute" -> findFirstIdentifier(func)
        else -> null
    }
}
