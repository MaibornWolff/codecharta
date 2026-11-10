package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal fun specifierNames(specifier: SyntaxNode): Sequence<String> = specifier
    .children()
    .filter { it.type == IDENTIFIER }
    .map { it.text.trim() }
