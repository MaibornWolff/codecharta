package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val IDENTIFIER = "identifier"
private const val PARAMETER_DECLARATION = "parameter_declaration"
private const val POINTER_DECLARATOR = "pointer_declarator"

internal fun extractAllBlockParameters(node: SyntaxNode): List<String> = node
    .children()
    .mapNotNull { child ->
        when (child.type) {
            PARAMETER_DECLARATION -> extractFromParameterDeclaration(child)
            POINTER_DECLARATOR, IDENTIFIER -> {
                CDeclaratorParser.findIdentifierInDeclarator(child)
            }
            else -> null
        }
    }.toList()
