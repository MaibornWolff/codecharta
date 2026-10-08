package de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val IDENTIFIER = "identifier"
private const val TYPE_IDENTIFIER = "type_identifier"

internal fun extractAllForwardClasses(node: SyntaxNode): List<String> = node
    .children()
    .filter { it.type == IDENTIFIER || it.type == TYPE_IDENTIFIER }
    .map { it.text }
    .toList()
