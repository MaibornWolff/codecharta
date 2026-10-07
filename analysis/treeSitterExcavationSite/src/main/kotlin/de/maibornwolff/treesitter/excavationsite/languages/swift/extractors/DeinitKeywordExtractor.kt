package de.maibornwolff.treesitter.excavationsite.languages.swift.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val DEINIT_KEYWORD = "deinit"

/**
 * Returns the constant keyword "deinit" for deinit declarations.
 */
internal fun extractDeinitKeyword(
    @Suppress("UNUSED_PARAMETER") node: SyntaxNode,
    @Suppress("UNUSED_PARAMETER") sourceCode: String
): String = DEINIT_KEYWORD
