package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.ARRAY_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.OBJECT_PATTERN
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val REST_PATTERN = "rest_pattern"
private const val REQUIRED_PARAMETER = "required_parameter"

/**
 * Extracts identifiers from formal parameters, handling rest patterns.
 */
internal fun extractIdentifiersFromFormalParameters(node: TSNode, sourceCode: String): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            REST_PATTERN -> {
                listOfNotNull(
                    TreeTraversal.findFirstChildTextByType(
                        child,
                        sourceCode,
                        IDENTIFIER
                    )
                )
            }
            OBJECT_PATTERN,
            ARRAY_PATTERN -> extractIdentifiersFromPattern(child, sourceCode)
            REQUIRED_PARAMETER -> {
                val patternChild = child.children().firstOrNull {
                    it.type == OBJECT_PATTERN || it.type == ARRAY_PATTERN
                }
                val restPattern = child.children().firstOrNull { it.type == REST_PATTERN }
                when {
                    patternChild != null -> extractIdentifiersFromPattern(patternChild, sourceCode)
                    restPattern != null -> listOfNotNull(
                        TreeTraversal.findFirstChildTextByType(restPattern, sourceCode, IDENTIFIER)
                    )
                    else -> emptyList()
                }
            }
            else -> emptyList()
        }
    }.toList()
