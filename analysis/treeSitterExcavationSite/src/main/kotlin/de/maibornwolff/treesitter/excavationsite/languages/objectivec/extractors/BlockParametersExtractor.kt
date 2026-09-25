package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.CDeclaratorParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val PARAMETER_DECLARATION = "parameter_declaration"
private const val POINTER_DECLARATOR = "pointer_declarator"

internal fun extractAllBlockParameters(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .mapNotNull { child ->
        when (child.type) {
            PARAMETER_DECLARATION -> extractFromParameterDeclaration(child, sourceCode)
            POINTER_DECLARATOR, IDENTIFIER -> {
                CDeclaratorParser.findIdentifierInDeclarator(child, sourceCode)
            }
            else -> null
        }
    }.toList()
