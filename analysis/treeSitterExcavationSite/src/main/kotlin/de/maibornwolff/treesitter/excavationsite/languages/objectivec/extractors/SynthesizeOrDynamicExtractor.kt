package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"
private const val SYNTHESIZE_PROPERTY = "synthesize_property"

internal fun extractFromSynthesizeOrDynamic(node: SyntaxNode): String? {
    for (child in node.children()) {
        when (child.type) {
            SYNTHESIZE_PROPERTY -> return extractFromSynthesizeProperty(child)
            IDENTIFIER -> return child.text
        }
    }
    return null
}

private fun extractFromSynthesizeProperty(node: SyntaxNode): String? = TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
