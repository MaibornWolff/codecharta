package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val LAMBDA_CAPTURE_INITIALIZER = "lambda_capture_initializer"

internal fun extractFromLambdaCaptures(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            IDENTIFIER -> listOf(TreeTraversal.getNodeText(child, sourceCode))
            LAMBDA_CAPTURE_INITIALIZER -> {
                listOfNotNull(
                    TreeTraversal.findFirstChildTextByType(child, sourceCode, IDENTIFIER)
                )
            }
            else -> emptyList()
        }
    }.toList()
