package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val DECLARATION = "declaration"
private const val POINTER_DECLARATOR = "pointer_declarator"
private const val ARRAY_DECLARATOR = "array_declarator"

internal fun extractFromForInStatement(node: TSNode, sourceCode: String): String? {
    for (child in node.children()) {
        when (child.type) {
            DECLARATION -> return extractFromDeclaration(child, sourceCode)
            POINTER_DECLARATOR, ARRAY_DECLARATOR -> {
                return CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
            }
            IDENTIFIER -> return TreeTraversal.getNodeText(child, sourceCode)
        }
    }
    return null
}
