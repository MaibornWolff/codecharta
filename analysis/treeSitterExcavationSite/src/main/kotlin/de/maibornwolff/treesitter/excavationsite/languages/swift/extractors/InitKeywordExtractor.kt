package de.maibornwolff.treesitter.excavationsite.languages.swift.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val INIT_KEYWORD = "init"

/**
 * Returns the constant keyword "init" for init declarations.
 */
internal fun extractInitKeyword(
    @Suppress("UNUSED_PARAMETER") node: SyntaxNode,
    @Suppress("UNUSED_PARAMETER") sourceCode: String
): String = INIT_KEYWORD
