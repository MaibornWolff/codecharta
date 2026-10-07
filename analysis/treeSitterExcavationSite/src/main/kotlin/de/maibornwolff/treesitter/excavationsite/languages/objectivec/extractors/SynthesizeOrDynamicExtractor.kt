package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"
private const val SYNTHESIZE_PROPERTY = "synthesize_property"

internal fun extractFromSynthesizeOrDynamic(node: SyntaxNode, sourceCode: String): String? {
    for (child in node.children()) {
        when (child.type) {
            SYNTHESIZE_PROPERTY -> return extractFromSynthesizeProperty(child, sourceCode)
            IDENTIFIER -> return TreeTraversal.getNodeText(child, sourceCode)
        }
    }
    return null
}

private fun extractFromSynthesizeProperty(node: SyntaxNode, sourceCode: String): String? =
    TreeTraversal.findFirstChildTextByType(node, sourceCode, IDENTIFIER)
