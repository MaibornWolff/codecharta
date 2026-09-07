package de.maibornwolff.treesitter.excavationsite.languages.swift.extractors

import org.treesitter.TSNode

private const val DEINIT_KEYWORD = "deinit"

/**
 * Returns the constant keyword "deinit" for deinit declarations.
 */
internal fun extractDeinitKeyword(
    @Suppress("UNUSED_PARAMETER") node: TSNode,
    @Suppress("UNUSED_PARAMETER") sourceCode: String
): String = DEINIT_KEYWORD
