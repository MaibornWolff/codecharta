package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val QUOTE = "\""
private const val APOSTROPHE = "'"
private val remMarker = Regex("^rem(\\s|$)", RegexOption.IGNORE_CASE)

internal fun declaredName(node: SyntaxNode): String? = node.getChildByFieldName("name").takeUnless { it.isNull }?.text

internal fun extractVbaComment(node: SyntaxNode): String = node.text.removePrefix(APOSTROPHE).replaceFirst(remMarker, "").trim()

internal fun extractVbaString(node: SyntaxNode): String = node.text.removeSurrounding(QUOTE).replace(QUOTE + QUOTE, QUOTE)
