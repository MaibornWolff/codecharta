package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.ARRAY_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.OBJECT_PATTERN
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val REST_PATTERN = "rest_pattern"
private const val REQUIRED_PARAMETER = "required_parameter"

/**
 * Extracts identifiers from formal parameters, handling rest patterns.
 */
internal fun extractIdentifiersFromFormalParameters(node: SyntaxNode): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            REST_PATTERN -> {
                listOfNotNull(
                    TreeTraversal.findFirstChildTextByType(
                        child,
                        IDENTIFIER
                    )
                )
            }
            OBJECT_PATTERN,
            ARRAY_PATTERN -> extractIdentifiersFromPattern(child)
            REQUIRED_PARAMETER -> {
                val patternChild = child.children().firstOrNull {
                    it.type == OBJECT_PATTERN || it.type == ARRAY_PATTERN
                }
                val restPattern = child.children().firstOrNull { it.type == REST_PATTERN }
                when {
                    patternChild != null -> extractIdentifiersFromPattern(patternChild)
                    restPattern != null -> listOfNotNull(
                        TreeTraversal.findFirstChildTextByType(restPattern, IDENTIFIER)
                    )
                    else -> emptyList()
                }
            }
            else -> emptyList()
        }
    }.toList()
