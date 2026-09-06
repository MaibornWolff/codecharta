package de.maibornwolff.treesitter.excavationsite.languages.swift.extractors

import org.treesitter.TSNode

private const val SUBSCRIPT_KEYWORD = "subscript"

/**
 * Returns the constant keyword "subscript" for subscript declarations.
 */
internal fun extractSubscriptKeyword(
    @Suppress("UNUSED_PARAMETER") node: TSNode,
    @Suppress("UNUSED_PARAMETER") sourceCode: String
): String = SUBSCRIPT_KEYWORD
