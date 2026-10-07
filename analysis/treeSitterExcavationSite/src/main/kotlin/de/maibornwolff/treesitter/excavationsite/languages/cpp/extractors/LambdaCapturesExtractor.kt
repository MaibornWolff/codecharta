package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val IDENTIFIER = "identifier"
private const val LAMBDA_CAPTURE_INITIALIZER = "lambda_capture_initializer"

internal fun extractFromLambdaCaptures(node: SyntaxNode): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            IDENTIFIER -> listOf(child.text)
            LAMBDA_CAPTURE_INITIALIZER -> {
                listOfNotNull(
                    TreeTraversal.findFirstChildTextByType(child, IDENTIFIER)
                )
            }
            else -> emptyList()
        }
    }.toList()
