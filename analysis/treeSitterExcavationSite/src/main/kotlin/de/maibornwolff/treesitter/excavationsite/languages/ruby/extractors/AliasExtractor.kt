package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val IDENTIFIER = "identifier"

/**
 * Extracts both identifiers from alias: `alias new_name old_name`
 */
internal fun extractAliasIdentifiers(node: SyntaxNode): List<String> = node
    .children()
    .filter { it.type == IDENTIFIER }
    .map { it.text }
    .toList()
