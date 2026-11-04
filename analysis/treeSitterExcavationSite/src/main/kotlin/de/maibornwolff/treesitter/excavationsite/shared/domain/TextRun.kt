package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Text a user reads that the grammar splits into sibling nodes, as `caf&eacute;teria` into a text, an entity and a
 * text: a run is the siblings of [partTypes] next to each other, and [join] reads one run in source order, or returns
 * null to skip it.
 */
data class TextRun(val partTypes: Set<String>, val join: (List<SyntaxNode>) -> String?)
