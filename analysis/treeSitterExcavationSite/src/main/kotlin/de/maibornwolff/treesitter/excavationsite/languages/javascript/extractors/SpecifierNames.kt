package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

// The JavaScript grammar types `default` in `{ default as Widget }` as a node of its own, the TypeScript grammar as an
// identifier
internal fun specifierNames(specifier: SyntaxNode): Sequence<String> = specifier
    .children()
    .filter { it.type == IDENTIFIER || it.type == DEFAULT_KEYWORD }
    .map { it.text.trim() }
